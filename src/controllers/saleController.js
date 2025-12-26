const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const { Sale, SaleItem, Product, InventoryMovement } = require("../models");

const list = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const limit = parseInt(req.query.limit || "100");

    const sales = await Sale.findAll({
      where: { organizationId: orgId, status: { [Op.ne]: "cancelled" } },
      order: [["createdAt", "DESC"]],
      limit,
    });

    res.json({ success: true, data: sales });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const { id } = req.params;

    const sale = await Sale.findOne({ where: { id, organizationId: orgId } });
    if (!sale) {
      return res
        .status(404)
        .json({ success: false, message: "Sale not found" });
    }

    const items = await SaleItem.findAll({
      where: { saleId: sale.id, organizationId: orgId },
    });

    res.json({ success: true, data: { ...sale.toJSON(), items } });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const orgId = req.auth.organization.id;
    const { sale, items } = req.body || {};

    if (!sale || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ success: false, message: "sale and items[] are required" });
    }

    const createdSale = await Sale.create(
      {
        organizationId: orgId,
        customerId: sale.customerId || null,
        subtotal: sale.subtotal ?? 0,
        tax: sale.tax ?? 0,
        discount: sale.discount ?? 0,
        total: sale.total ?? 0,
        currency: sale.currency || "VES",
        exchangeRate: sale.exchangeRate ?? 0,
        paymentMethod: sale.paymentMethod || null,
        paid: sale.paid ?? 0,
        change: sale.change ?? 0,
        status: sale.status || "completed",
        notes: sale.notes || null,
      },
      { transaction }
    );

    for (const item of items) {
      if (!item.productId || !item.productName || !item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Each item requires productId, productName, quantity",
        });
      }

      await SaleItem.create(
        {
          organizationId: orgId,
          saleId: createdSale.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price ?? 0,
          priceUSD: item.priceUSD ?? 0,
          subtotal: item.subtotal ?? item.quantity * (item.price ?? 0),
        },
        { transaction }
      );

      // Optional: decrement stock if product exists in this org
      const product = await Product.findOne({
        where: { id: item.productId, organizationId: orgId },
        transaction,
      });
      if (product) {
        const newStock = Math.max(0, (product.stock || 0) - item.quantity);
        await product.update({ stock: newStock }, { transaction });
      }
    }

    await transaction.commit();

    const createdItems = await SaleItem.findAll({
      where: { saleId: createdSale.id, organizationId: orgId },
    });

    res.status(201).json({
      success: true,
      data: { ...createdSale.toJSON(), items: createdItems },
    });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {}
    next(error);
  }
};

const cancel = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const orgId = req.auth.organization.id;
    const { id } = req.params;

    const sale = await Sale.findOne({
      where: { id, organizationId: orgId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!sale) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Sale not found" });
    }

    if (sale.status === "cancelled") {
      await transaction.rollback();
      return res.json({ success: true, message: "Sale already cancelled" });
    }

    // Restore stock only if it was actually deducted previously
    if (sale.status === "completed") {
      const items = await SaleItem.findAll({
        where: { saleId: sale.id, organizationId: orgId },
        transaction,
      });

      for (const item of items) {
        const qty = parseInt(item.quantity);
        if (!qty || qty <= 0) continue;

        const product = await Product.findOne({
          where: { id: item.productId, organizationId: orgId },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!product) continue;

        await product.update(
          { stock: (product.stock || 0) + qty },
          { transaction }
        );

        await InventoryMovement.create(
          {
            organizationId: orgId,
            productId: product.id,
            type: "sale_cancel",
            quantityDelta: qty,
            sourceId: sale.id,
            eventId: null,
          },
          { transaction }
        );
      }
    }

    await sale.update(
      { status: "cancelled", resolvedAt: new Date() },
      { transaction }
    );
    await transaction.commit();

    res.json({ success: true, message: "Sale cancelled" });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {}
    next(error);
  }
};

const resolvePending = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const orgId = req.auth.organization.id;
    const { id } = req.params;
    const { action, reason } = req.body || {};

    if (!action || !["approve", "reject"].includes(action)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "action must be 'approve' or 'reject'",
      });
    }

    const sale = await Sale.findOne({
      where: { id, organizationId: orgId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!sale) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Sale not found" });
    }

    if (sale.status !== "pending") {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: `Only pending sales can be resolved (current: ${sale.status})`,
      });
    }

    if (action === "reject") {
      if (!reason || String(reason).trim().length === 0) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ success: false, message: "reason is required to reject" });
      }

      await sale.update(
        {
          status: "rejected",
          rejectedReason: String(reason).trim(),
          rejectedAt: new Date(),
          resolvedAt: new Date(),
        },
        { transaction }
      );

      await transaction.commit();
      return res.json({ success: true, data: sale });
    }

    // Approve: attempt to deduct stock now
    const items = await SaleItem.findAll({
      where: { saleId: sale.id, organizationId: orgId },
      transaction,
    });

    if (!items || items.length === 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Sale has no items" });
    }

    const stockProblems = [];

    for (const item of items) {
      const qty = parseInt(item.quantity);
      if (!qty || qty <= 0) continue;

      const product = await Product.findOne({
        where: { id: item.productId, organizationId: orgId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        stockProblems.push({
          productId: item.productId,
          reason: "product not found",
          required: qty,
          available: 0,
        });
        continue;
      }

      const available = parseInt(product.stock || 0);
      if (available < qty) {
        stockProblems.push({
          productId: product.id,
          name: product.name,
          required: qty,
          available,
        });
      }
    }

    if (stockProblems.length > 0) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "Insufficient stock to approve pending sale",
        data: { stockProblems },
      });
    }

    // Deduct stock + record movements
    for (const item of items) {
      const qty = parseInt(item.quantity);
      if (!qty || qty <= 0) continue;

      const product = await Product.findOne({
        where: { id: item.productId, organizationId: orgId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!product) continue;

      await product.update(
        { stock: (product.stock || 0) - qty },
        { transaction }
      );

      await InventoryMovement.create(
        {
          organizationId: orgId,
          productId: product.id,
          type: "sale",
          quantityDelta: -qty,
          sourceId: sale.id,
          eventId: null,
        },
        { transaction }
      );
    }

    await sale.update(
      {
        status: "completed",
        rejectedReason: null,
        rejectedAt: null,
        resolvedAt: new Date(),
      },
      { transaction }
    );

    await transaction.commit();
    return res.json({ success: true, data: sale });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {}
    next(error);
  }
};

module.exports = { list, getById, create, cancel, resolvePending };

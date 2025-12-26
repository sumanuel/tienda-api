const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const {
  SyncEvent,
  InventoryMovement,
  Product,
  Customer,
  Sale,
  SaleItem,
  Setting,
  ExchangeRate,
} = require("../models");

const normalizeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const push = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const orgId = req.auth.organization.id;
    const { deviceId, events } = req.body || {};

    if (!Array.isArray(events) || events.length === 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ success: false, message: "events[] is required" });
    }

    const acked = [];
    const rejected = [];
    const results = [];

    for (const evt of events) {
      const eventId = evt?.eventId;
      const eventType = evt?.type;
      const entityId = evt?.entityId || null;
      const payload = evt?.payload || {};

      if (!eventId || !eventType) {
        rejected.push({
          eventId: eventId || null,
          reason: "eventId and type are required",
        });
        continue;
      }

      const existing = await SyncEvent.findOne({
        where: { organizationId: orgId, eventId },
        transaction,
      });

      if (existing) {
        acked.push(eventId);
        results.push({ eventId, status: "duplicate" });
        continue;
      }

      // Persist the sync event first (idempotency)
      await SyncEvent.create(
        {
          organizationId: orgId,
          eventId,
          deviceId: deviceId || null,
          eventType,
        },
        { transaction }
      );

      // Apply event
      if (eventType === "product.upserted") {
        const id = entityId || payload.id;
        if (!id) {
          rejected.push({ eventId, reason: "product id is required" });
          continue;
        }

        const [product] = await Product.findOrCreate({
          where: { id, organizationId: orgId },
          defaults: { ...payload, id, organizationId: orgId },
          transaction,
        });

        if (product) {
          const updateData = { ...payload };
          delete updateData.id;
          delete updateData.organizationId;
          await product.update(updateData, { transaction });
        }

        acked.push(eventId);
        results.push({ eventId, status: "applied", entity: "product", id });
        continue;
      }

      if (eventType === "customer.upserted") {
        const id = entityId || payload.id;
        if (!id || !payload.name) {
          rejected.push({
            eventId,
            reason: "customer id and name are required",
          });
          continue;
        }

        const [customer] = await Customer.findOrCreate({
          where: { id, organizationId: orgId },
          defaults: { ...payload, id, organizationId: orgId },
          transaction,
        });

        if (customer) {
          const updateData = { ...payload };
          delete updateData.id;
          delete updateData.organizationId;
          await customer.update(updateData, { transaction });
        }

        acked.push(eventId);
        results.push({ eventId, status: "applied", entity: "customer", id });
        continue;
      }

      if (eventType === "setting.upserted") {
        const key = payload.key;
        const value = payload.value;
        if (!key || value === undefined || value === null) {
          rejected.push({
            eventId,
            reason: "setting key and value are required",
          });
          continue;
        }

        const [setting] = await Setting.findOrCreate({
          where: { organizationId: orgId, key },
          defaults: { organizationId: orgId, key, value: String(value) },
          transaction,
        });

        if (setting.value !== String(value)) {
          await setting.update({ value: String(value) }, { transaction });
        }

        acked.push(eventId);
        results.push({ eventId, status: "applied", entity: "setting", key });
        continue;
      }

      if (eventType === "exchange_rate.created") {
        const { source, rate, fromCurrency, toCurrency, isActive } = payload;
        if (!source || rate === undefined || rate === null) {
          rejected.push({ eventId, reason: "source and rate are required" });
          continue;
        }

        if (isActive) {
          await ExchangeRate.update(
            { isActive: false },
            { where: { organizationId: orgId, isActive: true }, transaction }
          );
        }

        const created = await ExchangeRate.create(
          {
            organizationId: orgId,
            source,
            rate,
            fromCurrency: fromCurrency || "USD",
            toCurrency: toCurrency || "VES",
            isActive: !!isActive,
          },
          { transaction }
        );

        acked.push(eventId);
        results.push({
          eventId,
          status: "applied",
          entity: "exchangeRate",
          id: created.id,
        });
        continue;
      }

      if (eventType === "sale.created") {
        const saleId = entityId || payload.id;
        const saleData = payload.sale || payload;
        const items = payload.items || saleData.items;

        if (!saleId || !Array.isArray(items) || items.length === 0) {
          rejected.push({
            eventId,
            reason: "sale id and items[] are required",
          });
          continue;
        }

        // If sale already exists in org, treat as duplicate idempotently
        const existingSale = await Sale.findOne({
          where: { id: saleId, organizationId: orgId },
          transaction,
        });
        if (existingSale) {
          acked.push(eventId);
          results.push({
            eventId,
            status: "duplicate",
            entity: "sale",
            id: saleId,
          });
          continue;
        }

        // Validate items + stock strictly (multi-user).
        // If any item references a product that doesn't exist => reject (avoids FK violation).
        const stockProblems = [];
        for (const item of items) {
          const productId = item.productId;
          const quantity = parseInt(item.quantity);
          if (!productId || !quantity || quantity <= 0) {
            stockProblems.push({
              productId,
              reason: "invalid productId/quantity",
            });
            continue;
          }

          const product = await Product.findOne({
            where: { id: productId, organizationId: orgId },
            transaction,
          });
          if (!product) {
            stockProblems.push({ productId, reason: "product not found" });
            continue;
          }

          if ((product.stock || 0) < quantity) {
            stockProblems.push({
              productId,
              reason: "insufficient stock",
              available: product.stock || 0,
              requested: quantity,
            });
          }
        }

        const invalidProblems = stockProblems.filter(
          (p) =>
            p.reason === "product not found" ||
            p.reason === "invalid productId/quantity"
        );

        if (invalidProblems.length > 0) {
          rejected.push({
            eventId,
            reason: "sale items reference missing/invalid products",
            details: invalidProblems,
          });
          continue;
        }

        const status =
          stockProblems.length > 0 ? "pending" : saleData.status || "completed";

        let customerIdToUse = saleData.customerId || null;
        if (customerIdToUse) {
          const customerExists = await Customer.findOne({
            where: { id: customerIdToUse, organizationId: orgId },
            transaction,
          });

          if (!customerExists) {
            customerIdToUse = null;
          }
        }

        const createdSale = await Sale.create(
          {
            id: saleId,
            organizationId: orgId,
            customerId: customerIdToUse,
            subtotal: saleData.subtotal ?? 0,
            tax: saleData.tax ?? 0,
            discount: saleData.discount ?? 0,
            total: saleData.total ?? 0,
            currency: saleData.currency || "VES",
            exchangeRate: saleData.exchangeRate ?? 0,
            paymentMethod: saleData.paymentMethod || null,
            paid: saleData.paid ?? 0,
            change: saleData.change ?? 0,
            status,
            notes: saleData.notes || null,
            createdAt: normalizeDate(saleData.createdAt) || undefined,
            updatedAt: normalizeDate(saleData.updatedAt) || undefined,
          },
          { transaction }
        );

        for (const item of items) {
          if (!item.productId || !item.productName || !item.quantity) {
            continue;
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
        }

        if (createdSale.status === "completed") {
          for (const item of items) {
            const product = await Product.findOne({
              where: { id: item.productId, organizationId: orgId },
              transaction,
            });
            if (!product) continue;

            const qty = parseInt(item.quantity);
            if (!qty || qty <= 0) continue;

            const newStock = (product.stock || 0) - qty;
            await product.update({ stock: newStock }, { transaction });

            await InventoryMovement.create(
              {
                organizationId: orgId,
                productId: product.id,
                type: "sale",
                quantityDelta: -qty,
                sourceId: createdSale.id,
                eventId,
              },
              { transaction }
            );
          }
        }

        acked.push(eventId);
        results.push({
          eventId,
          status: "applied",
          entity: "sale",
          id: createdSale.id,
          saleStatus: createdSale.status,
          stockProblems,
        });
        continue;
      }

      if (eventType === "sale.cancelled") {
        const saleId = entityId || payload.id || payload.saleId;
        if (!saleId) {
          rejected.push({ eventId, reason: "saleId is required" });
          continue;
        }

        const sale = await Sale.findOne({
          where: { id: saleId, organizationId: orgId },
          transaction,
        });
        if (!sale) {
          // If it doesn't exist, treat as rejected (can't cancel unknown sale)
          rejected.push({ eventId, reason: "sale not found" });
          continue;
        }

        if (sale.status === "cancelled") {
          acked.push(eventId);
          results.push({
            eventId,
            status: "duplicate",
            entity: "sale",
            id: saleId,
          });
          continue;
        }

        // If sale was completed, restore stock
        if (sale.status === "completed") {
          const items = await SaleItem.findAll({
            where: { saleId: sale.id, organizationId: orgId },
            transaction,
          });
          for (const item of items) {
            const product = await Product.findOne({
              where: { id: item.productId, organizationId: orgId },
              transaction,
            });
            if (!product) continue;

            const qty = parseInt(item.quantity);
            if (!qty || qty <= 0) continue;

            const newStock = (product.stock || 0) + qty;
            await product.update({ stock: newStock }, { transaction });

            await InventoryMovement.create(
              {
                organizationId: orgId,
                productId: product.id,
                type: "sale_cancel",
                quantityDelta: qty,
                sourceId: sale.id,
                eventId,
              },
              { transaction }
            );
          }
        }

        await sale.update({ status: "cancelled" }, { transaction });

        acked.push(eventId);
        results.push({
          eventId,
          status: "applied",
          entity: "sale",
          id: saleId,
          saleStatus: "cancelled",
        });
        continue;
      }

      // Unknown event type
      rejected.push({
        eventId,
        reason: `unsupported event type: ${eventType}`,
      });
    }

    await transaction.commit();

    res.json({
      success: true,
      data: {
        acked,
        rejected,
        results,
        serverTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {}
    next(error);
  }
};

const pull = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const since = normalizeDate(req.query.since);

    if (!since) {
      return res
        .status(400)
        .json({ success: false, message: "since (ISO date) is required" });
    }

    const whereSince = { organizationId: orgId, updatedAt: { [Op.gt]: since } };

    const [products, customers, sales, saleItems, settings, exchangeRates] =
      await Promise.all([
        Product.findAll({
          where: whereSince,
          order: [["updatedAt", "ASC"]],
          limit: 5000,
        }),
        Customer.findAll({
          where: whereSince,
          order: [["updatedAt", "ASC"]],
          limit: 5000,
        }),
        Sale.findAll({
          where: whereSince,
          order: [["updatedAt", "ASC"]],
          limit: 5000,
        }),
        SaleItem.findAll({
          where: whereSince,
          order: [["updatedAt", "ASC"]],
          limit: 10000,
        }),
        Setting.findAll({
          where: whereSince,
          order: [["updatedAt", "ASC"]],
          limit: 2000,
        }),
        ExchangeRate.findAll({
          where: whereSince,
          order: [["updatedAt", "ASC"]],
          limit: 2000,
        }),
      ]);

    res.json({
      success: true,
      data: {
        products,
        customers,
        sales,
        saleItems,
        settings,
        exchangeRates,
        nextSince: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { push, pull };

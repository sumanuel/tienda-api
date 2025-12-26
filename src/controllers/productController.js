const { Product } = require("../models");

const getAll = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;

    const products = await Product.findAll({
      where: { organizationId: orgId, active: true },
      order: [["name", "ASC"]],
    });

    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const org = req.auth.organization;

    if (org.plan === "free") {
      const max = parseInt(process.env.FREE_MAX_PRODUCTS || "200");
      const count = await Product.count({
        where: { organizationId: org.id, active: true },
      });
      if (count >= max) {
        return res.status(402).json({
          success: false,
          message: `Free plan limit reached (max ${max} active products). Upgrade to Pro.`,
        });
      }
    }

    const {
      name,
      barcode,
      category,
      description,
      cost,
      priceUSD,
      priceVES,
      margin,
      stock,
      minStock,
      image,
    } = req.body || {};
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "name is required" });
    }

    const product = await Product.create({
      organizationId: org.id,
      name,
      barcode: barcode || null,
      category: category || null,
      description: description || null,
      cost: cost ?? 0,
      priceUSD: priceUSD ?? 0,
      priceVES: priceVES ?? 0,
      margin: margin ?? 0,
      stock: stock ?? 0,
      minStock: minStock ?? 0,
      image: image || null,
      active: true,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const { id } = req.params;

    const product = await Product.findOne({
      where: { id, organizationId: orgId },
    });
    if (!product || !product.active) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const updateData = req.body || {};
    delete updateData.organizationId;

    await product.update(updateData);

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const { id } = req.params;

    const product = await Product.findOne({
      where: { id, organizationId: orgId },
    });
    if (!product || !product.active) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await product.update({ active: false });

    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, remove };

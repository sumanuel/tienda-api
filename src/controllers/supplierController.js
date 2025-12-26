const { Supplier } = require("../models");

const list = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const suppliers = await Supplier.findAll({
      where: { organizationId: orgId, active: true },
      order: [["name", "ASC"]],
    });
    res.json({ success: true, data: suppliers });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const { id } = req.params;

    const supplier = await Supplier.findOne({
      where: { id, organizationId: orgId },
    });
    if (!supplier || !supplier.active) {
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found" });
    }

    res.json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const {
      documentNumber,
      name,
      email,
      phone,
      address,
      contactPerson,
      paymentTerms,
    } = req.body || {};

    if (!documentNumber || !name) {
      return res
        .status(400)
        .json({
          success: false,
          message: "documentNumber and name are required",
        });
    }

    const supplier = await Supplier.create({
      organizationId: orgId,
      documentNumber,
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      contactPerson: contactPerson || null,
      paymentTerms: paymentTerms || null,
      active: true,
    });

    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const { id } = req.params;

    const supplier = await Supplier.findOne({
      where: { id, organizationId: orgId },
    });
    if (!supplier || !supplier.active) {
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found" });
    }

    const updateData = req.body || {};
    delete updateData.organizationId;

    await supplier.update(updateData);

    res.json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const { id } = req.params;

    const supplier = await Supplier.findOne({
      where: { id, organizationId: orgId },
    });
    if (!supplier || !supplier.active) {
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found" });
    }

    await supplier.update({ active: false });

    res.json({ success: true, message: "Supplier deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, getById, create, update, remove };

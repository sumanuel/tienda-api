const { Customer } = require("../models");

const list = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const customers = await Customer.findAll({
      where: { organizationId: orgId, active: true },
      order: [["name", "ASC"]],
    });
    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const { id } = req.params;

    const customer = await Customer.findOne({
      where: { id, organizationId: orgId },
    });
    if (!customer || !customer.active) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const { name, email, phone, address, documentType, documentNumber } =
      req.body || {};

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "name is required" });
    }

    const customer = await Customer.create({
      organizationId: orgId,
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      documentType: documentType || null,
      documentNumber: documentNumber || null,
      totalPurchases: 0,
      active: true,
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const { id } = req.params;

    const customer = await Customer.findOne({
      where: { id, organizationId: orgId },
    });
    if (!customer || !customer.active) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    const updateData = req.body || {};
    delete updateData.organizationId;

    await customer.update(updateData);

    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const { id } = req.params;

    const customer = await Customer.findOne({
      where: { id, organizationId: orgId },
    });
    if (!customer || !customer.active) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    await customer.update({ active: false });

    res.json({ success: true, message: "Customer deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, getById, create, update, remove };

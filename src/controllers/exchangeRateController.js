const { ExchangeRate } = require("../models");

const list = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const rates = await ExchangeRate.findAll({
      where: { organizationId: orgId },
      order: [["createdAt", "DESC"]],
      limit: 200,
    });
    res.json({ success: true, data: rates });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const { source, rate, fromCurrency, toCurrency, isActive } = req.body || {};

    if (!source || rate === undefined || rate === null) {
      return res
        .status(400)
        .json({ success: false, message: "source and rate are required" });
    }

    // If isActive true, deactivate other active rates for this org
    if (isActive) {
      await ExchangeRate.update(
        { isActive: false },
        { where: { organizationId: orgId, isActive: true } }
      );
    }

    const created = await ExchangeRate.create({
      organizationId: orgId,
      source,
      rate,
      fromCurrency: fromCurrency || "USD",
      toCurrency: toCurrency || "VES",
      isActive: !!isActive,
    });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
};

const setActive = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const { id } = req.params;

    const rate = await ExchangeRate.findOne({
      where: { id, organizationId: orgId },
    });
    if (!rate) {
      return res
        .status(404)
        .json({ success: false, message: "Rate not found" });
    }

    await ExchangeRate.update(
      { isActive: false },
      { where: { organizationId: orgId, isActive: true } }
    );

    await rate.update({ isActive: true });

    res.json({ success: true, data: rate });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, create, setActive };

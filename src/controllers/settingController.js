const { Setting } = require("../models");

const list = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const settings = await Setting.findAll({
      where: { organizationId: orgId },
      order: [["key", "ASC"]],
      limit: 500,
    });
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

const upsert = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const { key, value } = req.body || {};

    if (!key || value === undefined || value === null) {
      return res
        .status(400)
        .json({ success: false, message: "key and value are required" });
    }

    const [setting] = await Setting.findOrCreate({
      where: { organizationId: orgId, key },
      defaults: { organizationId: orgId, key, value: String(value) },
    });

    if (setting.value !== String(value)) {
      await setting.update({ value: String(value) });
    }

    res.json({ success: true, data: setting });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, upsert };

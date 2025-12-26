const { Organization } = require("../models");

const getMyOrg = async (req, res, next) => {
  try {
    const org = req.auth.organization;
    res.json({
      success: true,
      data: {
        id: org.id,
        name: org.name,
        plan: org.plan,
        isActive: org.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const orgId = req.auth.organization.id;
    const { plan } = req.body || {};

    if (!plan || !["free", "pro"].includes(plan)) {
      return res
        .status(400)
        .json({ success: false, message: "plan must be 'free' or 'pro'" });
    }

    const org = await Organization.findByPk(orgId);
    await org.update({ plan });

    res.json({
      success: true,
      data: { id: org.id, name: org.name, plan: org.plan },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyOrg, updatePlan };

const { Organization, User, Membership } = require("../models");
const { hashPassword, verifyPassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");

const register = async (req, res, next) => {
  try {
    const { orgName, email, password, name } = req.body || {};

    if (!orgName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "orgName, email and password are required",
      });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    const organization = await Organization.create({
      name: orgName,
      plan: "free",
    });
    const user = await User.create({
      email,
      name: name || null,
      passwordHash: await hashPassword(password),
    });

    await Membership.create({
      organizationId: organization.id,
      userId: user.id,
      role: "owner",
    });

    const token = signToken({
      userId: user.id,
      orgId: organization.id,
      role: "owner",
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        organization: {
          id: organization.id,
          name: organization.name,
          plan: organization.plan,
        },
        user: { id: user.id, email: user.email, name: user.name },
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, orgId } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "email and password are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    let membership;

    if (orgId) {
      membership = await Membership.findOne({
        where: { userId: user.id, organizationId: orgId },
      });
    } else {
      membership = await Membership.findOne({ where: { userId: user.id } });
    }

    if (!membership) {
      return res
        .status(403)
        .json({ success: false, message: "No organization membership found" });
    }

    const organization = await Organization.findByPk(membership.organizationId);
    if (!organization || !organization.isActive) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Organization not found or inactive",
        });
    }

    const token = signToken({
      userId: user.id,
      orgId: organization.id,
      role: membership.role,
    });

    res.json({
      success: true,
      data: {
        token,
        organization: {
          id: organization.id,
          name: organization.name,
          plan: organization.plan,
        },
        user: { id: user.id, email: user.email, name: user.name },
        role: membership.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };

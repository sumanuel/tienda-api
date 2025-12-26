const { verifyToken } = require("../utils/jwt");
const { Organization, User, Membership } = require("../models");

const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res
        .status(401)
        .json({ success: false, message: "Missing Bearer token" });
    }

    const payload = verifyToken(token);

    const [user, organization, membership] = await Promise.all([
      User.findByPk(payload.userId),
      Organization.findByPk(payload.orgId),
      Membership.findOne({
        where: { userId: payload.userId, organizationId: payload.orgId },
      }),
    ]);

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "User not found or inactive" });
    }

    if (!organization || !organization.isActive) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Organization not found or inactive",
        });
    }

    if (!membership) {
      return res
        .status(403)
        .json({
          success: false,
          message: "User is not member of organization",
        });
    }

    req.auth = {
      user,
      organization,
      membership,
      role: membership.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

const requireRole = (roles) => {
  const allowed = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    const role = req.auth?.role;
    if (!role || !allowed.includes(role)) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient role" });
    }
    next();
  };
};

module.exports = { requireAuth, requireRole };

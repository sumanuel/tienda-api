const jwt = require("jsonwebtoken");

const signToken = ({ userId, orgId, role }) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET");
  }

  return jwt.sign({ userId, orgId, role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET");
  }
  return jwt.verify(token, secret);
};

module.exports = { signToken, verifyToken };

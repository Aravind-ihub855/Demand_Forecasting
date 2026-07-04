const jwt = require("jsonwebtoken");
const env = require("../config/env");

const createToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    issuer: env.jwtIssuer,
    audience: env.jwtAudience,
    algorithm: "HS256",
  });

module.exports = createToken;

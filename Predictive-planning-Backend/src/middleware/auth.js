const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: no token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: token expired" });
    }
    return res.status(403).json({ message: "Forbidden: invalid token" });
  }
};

/**
 * Role-based access control middleware.
 * Usage: requireRoles("admin", "manager")
 */
const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: requires role ${roles.join(" or ")}` });
    }
    next();
  };
};

// requireAuth is an alias for authenticate — keeps older route imports working
const requireAuth = authenticate;

module.exports = { authenticate, requireAuth, requireRoles };
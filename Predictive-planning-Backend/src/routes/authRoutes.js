const express = require("express");
const validate = require("../middleware/validate");
const { requireAuth, requireRoles } = require("../middleware/auth");
const { registerSchema, loginSchema } = require("../schemas/authSchemas");
const {
  register,
  login,
  me,
  adminOnly,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", requireAuth, me);
router.get("/admin", requireAuth, requireRoles("admin"), adminOnly);

module.exports = router;

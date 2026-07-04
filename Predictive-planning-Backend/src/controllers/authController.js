const bcrypt = require("bcryptjs");
const User = require("../models/User");
const createToken = require("../utils/createToken");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });

  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "user",
  });

  const token = createToken(user);
  return res.status(201).json({
    message: "Registration successful",
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = createToken(user);
  return res.status(200).json({
    message: "Login successful",
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

const me = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

const adminOnly = async (req, res) => {
  return res.status(200).json({
    message: "Admin access granted",
    user: req.user,
  });
};

module.exports = { register, login, me, adminOnly };

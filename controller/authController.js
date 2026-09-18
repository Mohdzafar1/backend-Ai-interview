const jwt = require('jsonwebtoken');
const User = require('../model/User.js');
const bcrypt = require('bcryptjs');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

// REGISTER
exports.register = async (req, res) => {
  try {
    console.log("BODY 👉", req.body);

    const { name, email, password,applyFor, } = req.body;

    const exists = await User.findOne({ email });
    console.log("EXISTS 👉", exists);

    const user = await User.create({
      name,
      email,
      password,
      applyFor
    });

    console.log("USER CREATED 👉", user);

    res.status(201).json({
      token: generateToken(user._id),
      user
    });

  } catch (err) {
    console.log("ERROR 👉", err); // 🔥 MUST ADD
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Find user properly
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Admin check
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can access this" });
    }

    // ✅ Get all candidates
    const candidates = await User.find({ role: "candidate" });

    return res.status(200).json({
      message: "Candidate list",
      users: candidates
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getMe = (req, res) => {
  res.json(req.user);
};
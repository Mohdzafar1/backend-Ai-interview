const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['candidate', 'admin'], default: 'candidate' },
  status: { type: Boolean, default: false },
  applyFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required:true}],

  createdAt: { type: Date, default: Date.now }
});

// ✅ FIXED: remove next()
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// compare password
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
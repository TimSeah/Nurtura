const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const userSchema = new mongoose.Schema({
  //email:       { type: String, required: true, unique: true },
  username:    { type: String, required: true, unique: true, trim: true },
  passwordHash:{ type: String, required: true },
  createdAt:   { type: Date,   default: Date.now }
});

userSchema.methods.verifyPassword = function(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

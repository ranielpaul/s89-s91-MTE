const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, 'email is required'], 
  },
  username: { 
    type: String, 
    required: [true, 'username is required'], 
  },
  password: { 
    type: String, 
    required: [true, 'password is required'] 
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password)
}

module.exports = mongoose.model('User', userSchema)
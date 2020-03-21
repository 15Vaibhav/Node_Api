const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    default: 0,
  },
  email: {
    type: String,
    required: true,
    validate(value) {
        if (!validator.isEmail(value)) {
        throw new Error('email is not valid');
        }
    },
  },
});

module.exports = mongoose.model('User', userSchema);

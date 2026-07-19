// models/User.js

const mongoose = require('mongoose')
const Schemas_mongodb = mongoose.Schema

const userSchema = new Schemas_mongodb({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
},
  {
    timestamps: true
  })

module.exports = mongoose.model('RakshapathUsers', userSchema)
// module.exports = mongoose.model('User', userSchema)

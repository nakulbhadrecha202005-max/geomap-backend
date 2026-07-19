const express = require('express')
const router = express.Router()

const validateCreateRoom = require('./Validation_Maps_features')
const middleware_auth_user = require('../configDB/Auth_User_middleware')
const Controller_FinalRoute = require('./Controller_FinalRoute')

router.post(
  '/create-room',
  middleware_auth_user,
  validateCreateRoom,
  Controller_FinalRoute
)

module.exports = router

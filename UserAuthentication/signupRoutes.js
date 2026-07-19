const routers = require('express').Router()
const { signupController } = require('./controller')
const { login } = require('./controller')

const { validatelogin } = require('./validations')
const { validatesignup } = require('./validations')

routers.post('/signup', validatesignup , signupController)

routers.post('/login', validatelogin , login)

module.exports = routers

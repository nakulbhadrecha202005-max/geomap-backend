const Joi = require('joi')

const validatesignup = (req, res, next) => {
  const signupSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  })
  const { error } = signupSchema.validate(req.body)
  if (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
  next()
}

const validatelogin = (req, res, next) => {
  const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  })
  const { error } = loginSchema.validate(req.body)
  console.log('req', req.body)
  if (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
  next()
}
module.exports = {
  validatesignup,
validatelogin}

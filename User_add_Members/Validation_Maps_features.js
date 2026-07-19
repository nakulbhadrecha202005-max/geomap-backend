const Joi = require('joi')

const validateCreateRoom = (req, res, next) => {
  console.log('email:', req.user.email)
  const schema = Joi.object({
    roomName: Joi.string().min(3).max(50).required()
  })

  const { error } = schema.validate(req.body)

  if (error) {
    return res.status(400).json({
      message: error.details[0].message
    })
  }

  next()
}

module.exports = validateCreateRoom

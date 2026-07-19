const jwt = require('jsonwebtoken')
const Auth_User_middleware = (req, res, next) => {
  const JWT_SECRET = 'Rakshapath'
  const token = req.cookies.token // Look for the token in cookies

  if (!token) {
    // If there's no token, redirect them to login
    return res.redirect('/')
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded; // Attach user info (id, name) to the request object
    next()
  } catch (err) {
    res.clearCookie('token')
    return res.redirect('/')
  }
}

module.exports = Auth_User_middleware

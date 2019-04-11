const jwt = require("jsonwebtoken")

module.exports = function isAuthenticated(req, res, next) {
  if (req.headers.access_token) {
    const decodedToken = jwt.verify(req.headers.access_token, process.env.JWT_SECRET)
    req.authenticatedUser = decodedToken
    next()
  }
  else {
    res.status(401).json({
      message: "You are not authenticated. Please login."
    })
  }
}
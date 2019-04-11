const jwt = require("jsonwebtoken")

module.exports = {
  sign: function(payload) {
    const token = jwt.sign(payload, process.env.JWT_SECRET)
    return token
  },
  verify: function(token) {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    return decodedToken
  }
}
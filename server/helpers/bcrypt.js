const bcrypt = require("bcryptjs")
const salt = bcrypt.genSaltSync(10);

module.exports = {
  hashSync: function(rawPassword) {
    let hash = bcrypt.hashSync(rawPassword, salt);

    return hash
  },
  compareSync: function(inputPassword, passwordFromDatabase) {
    return bcrypt.compareSync(inputPassword, passwordFromDatabase)
  }
}
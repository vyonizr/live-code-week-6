const mongoose = require("mongoose")
const {Schema} = mongoose
const bcrypt = require("bcryptjs")

const userSchema = new Schema({
  email: {
    type: String,
    validate: {
      validator: function isUnique(email) {
        return User.findOne({
          email
        })
        .then(foundUser => {
          if (foundUser) {
            throw "Email is already registered"
          }
        })
      }
    }
  },
  password: String,
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: "Joke"
  }]
})

userSchema.pre('save', function(next) {
  let user = this
  let salt = bcrypt.genSaltSync()
  let hash = bcrypt.hashSync(user.password, salt)

  user.password = hash
  next()
});

const User = mongoose.model("User", userSchema)

module.exports = User
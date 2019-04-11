const User = require("../models/user")
const { bcrypt, jwt } = require("../helpers")

class UserController {
  static login(req, res) {
    User.findOne({
      email: req.body.email
    })
    .then(foundUser => {
      if (!foundUser) {
        res.status(404).json({
          message: "Email not found"
        })
      }
      else if (bcrypt.compareSync(req.body.password, foundUser.password)) {
        const token = jwt.sign({
          id: foundUser._id,
          email: foundUser.email,
          name: foundUser.name
        })

        res.status(200).json({
          token,
          id: foundUser._id,
          name: foundUser.name
        })
      }
      else {
        res.status(401).json({
          message: "Wrong username/password"
        })
      }
    })
    .catch(err => {
      res.status(500).json(err)
    })
  }

  static register(req, res) {
    User.create({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password
    })
    .then(createdUser => {
      const token = jwt.sign({
        id: createdUser._id,
        email: createdUser.email,
        name: createdUser.name
      })

      res.status(200).json({ token })
    })
    .catch(err => {
      if (err.errors.email || err.errors.name || err.errors.password) {
        res.status(400).json({
          message: err.message
        })
      }
      else {
        res.status(500).json(err)
      }
    })
  }
}

module.exports = UserController
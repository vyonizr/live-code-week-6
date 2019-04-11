const router = require("express").Router()
const User = require("../models/user")
const Joke = require("../models/joke")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const axios = require("axios")
const { isAuthenticated, isAuthorized } = require("../middlewares/")

let dadJokeApi = axios.create({
  baseURL: "https://icanhazdadjoke.com"
})

dadJokeApi.defaults.headers.common["Accept"] = "text/plain"

router.get("/jokes", (req, res) => {
  dadJokeApi.get(`/`)
  .then(({ data }) => {
    res.status(200).json({ joke: data })
  })
  .catch(err => {
    res.status(500).json(err)
  })
})

router.get("/user/:userId", (req, res) => {
  User.findById(req.params.userId)
  .then(foundUser => {
    res.send(200).json(foundUser.favorites)
  })
  .catch(err => {
    res.send(200).json(err)
  })
})

router.post("/register", (req,res) => {
  User.create({
    email: req.body.email,
    password: req.body.password
  })
  .then(createdUser => {
    res.status(201).json(createdUser)
  })
  .catch(err => {
    if (err.name == "ValidationError") {
      res.status(400).json(err)
    }
    else {
      res.status(500).json(err)
    }
  })
})

router.post("/login", (req,res) => {
  User.findOne({
    email: req.body.email
  })
  .then(foundUser => {
    if (!foundUser) {
      throw {
        status: 404,
        message: "Email not found"
      }
    }
    else if (!bcrypt.compareSync(req.body.password, foundUser.password)) {
      throw {
        status: 401,
        message: "Incorrect credentials"
      }
    }
    else {
      let token = jwt.sign({
        id: foundUser._id,
        email: foundUser.email
      }, process.env.JWT_SECRET)

      res.status(200).json({access_token: token})
    }
  })
  .catch(err => {
    if (err.status) {
      res.status(err.status).json(err)
    }
    else {
      res.status(500).json(err)
    }
  })
})

router.get("/favorites", isAuthenticated, (req, res) => {
  User.findById(req.authenticatedUser.id)
  .populate("favorites")
  .then(foundUser => {
    res.status(200).json(foundUser.favorites)
  })
  .catch(err => {
    res.status(500).json(err)
  })
})

router.post("/favorites", isAuthenticated, (req, res) => {
  let jokeDoc = null
  Joke.findOne({
    joke: req.body.joke,
    UserId: req.authenticatedUser.id
  })
  .then(foundJoke => {
    if (!foundJoke) {
      return Joke.create({
        joke: req.body.joke,
        UserId: req.authenticatedUser.id
      })
    }
    else {
      return foundJoke
    }
  })
  .then(joke => {
    jokeDoc = joke
    return User.findByIdAndUpdate(req.authenticatedUser.id, {
      $push: {
        favorites: jokeDoc
      }
    }, { new: true })
  })
  .then(foundUser => {
    res.status(200).json(jokeDoc)
  })
  .catch(err => {
    res.status(500).json(err)
  })
})

router.delete("/favorites/:id", isAuthenticated, isAuthorized, (req, res) => {
  User.findByIdAndUpdate(req.authenticatedUser.id, {
    $pullAll: {
      favorites: [req.params.id]
    }
  })
  .then(updatedUser => {
    return Joke.findByIdAndDelete(req.params.id)
  })
  .then(deletedJoke => {
    res.status(200).json(deletedJoke)
  })
  .catch(err => {
    res.status(500).json(err)
  })
})

module.exports = router
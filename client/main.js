const baseURL = "http://localhost:3000"

new Vue({
  el: "#app",
  data: {
    joke: "",
    access_token: localStorage.getItem("access_token"),
    showLoginForm: false,
    emailInputLogin: "",
    passwordInputLogin: "",
    favoritedJokes: []
  },

  created() {
    axios.get(`${baseURL}/jokes`)
    .then(({ data } ) => {
      this.joke = data.joke
    })
    .catch(err => {
      console.log(err);
    })

    if (localStorage.getItem("access_token")) {
      this.fetchFavoritedJokes()
    }
  },

  methods: {
    login() {
      axios.post(`${baseURL}/login`, {
        email: this.emailInputLogin,
        password: this.passwordInputLogin
      })
      .then(({ data }) => {
        localStorage.setItem("access_token", data.access_token)
        this.access_token = localStorage.getItem("access_token")
        Swal.fire({
          type: 'success',
        })
      })
      .catch(err => {
        Swal.fire({
          type: 'error',
          title: 'Oops...',
          text: err,
        })
      })
    },

    logout() {
      localStorage.clear()
      this.access_token = localStorage.getItem("access_token")
      this.joke = ""
    },

    addToFavorite(favoritedJoke) {
      axios.post(`${baseURL}/favorites`, {
        joke: favoritedJoke
      }, {
        headers: {
          access_token: localStorage.getItem("access_token")
        }
      })
      .then(({ data }) => {
        Swal.fire({
          type: 'success',
          title: 'Yay!',
          text: "Added to your favorite",
        })

        this.favoritedJokes.push(data)
      })
      .catch(err => {
        Swal.fire({
          type: 'error',
          title: 'Oops...',
          text: "Wrong credentials!",
        })
      })
    },

    generateNewJoke() {
      axios.get(`${baseURL}/jokes`)
      .then(({ data } ) => {
        this.joke = data.joke
      })
      .catch(err => {
        console.log(err);
      })
    },

    fetchFavoritedJokes() {
      axios.get(`${baseURL}/favorites`, {
        headers: {
          access_token: localStorage.getItem("access_token")
        }
      })
      .then(({ data }) => {
        this.favoritedJokes = data
      })
      .catch(err => {
        Swal.fire({
          type: 'error',
          title: 'Oops...',
          text: "Error assigining favorite joke :(",
        })
      })
    },

    removeFavoritedJoke(jokeId, userId) {
      axios.delete(`${baseURL}/favorites/${jokeId}`, {
        headers: {
          access_token: localStorage.getItem("access_token"),
          authorization: userId
        }
      })
      .then(({ data }) => {
        Swal.fire({
          type: 'success',
          title: "Removed the joke",
          text: "Wasn't it funny for you? :(",
        })
        this.favoritedJokes = this.favoritedJokes.filter(doc => {
          return doc._id !== data._id
        })
      })
      .catch(err => {
        console.log(err);
      })
    }
  }
})

const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const db = require('./route-model')
const { authenticate } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  const user = req.body;
  const hash = bcrypt.hashSync(user.password, 8);
  user.password = hash;
  if (user.username && user.password) {
    db.add(user) //add the user
      .then(user => {
        res.status(201).json(user);
      })
      .catch(err => {
        res.status(500).json(err);
      });
  } else {
    res.status(401).json({ message: "No username or pass" });
  }
}

function login(req, res) {
  const { username, password } = req.body;

  if (username && password) {
    db.findByUser({ username })
      .then(user => {
        if (bcrypt.compareSync(password, user.password)) {
          const token = generateToken(user);
          res.status(200).json({ message: `welcome ${user.username}`, token });
        } else {
          res.status(401).json({ message: "Invalid username or password!" });
        }
      })
      .catch(err => {
        res.status(500).json(err);
      });
  } else {
    res.status(401).json({ message: "No Pass or Username" });
  }
}

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username
  };
  const options = {
    expiresIn: "1d"
  };
  return jwt.sign(payload, secret, options);
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
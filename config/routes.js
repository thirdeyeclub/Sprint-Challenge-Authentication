const axios = require('axios');

const { authenticate } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 4)
  user.password = hash;
  add(user).then(add=>{
    res.status(201).json(add);
  }).catch(err=>{
    res.status(500).json(err);
  })
}

function login(req, res) {
  // implement user login
  let {username, password} = req.body;
  findBy({username}).then(
    user=>{
      if(user && bcrypt.compareSync(password, user.password)){
        const payload = {
          subject: user.id,
          username: user.username
        }
        const options = {
          expiresIn: '1d'
        }
        const token = jwt.sign(payload, jwt, options)
        res.status(200).json({message: `Hello ${user.username}.`, token});
      } else{
        res.status(401).json({message: 'No Pass'});
      }
    }
  ).catch(err=>{
    res.status(500).json(err);
  })
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

async function add(user) {
  const [id] = await db('users').insert(user)
  return db('users').where({id}).first()
}

function findBy(filter) {
  return db('users').where(filter).first()
}
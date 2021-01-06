const bodyParser = require('body-parser')
const express = require('express')
const bcrypt = require('bcrypt')
const saltRounds = 10;
const cors = require('cors');
const knex = require('knex')
const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'rahul1429',
      database : 'smart-brain'
    }
  });



const app = express()
app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send(database.users)
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*').from('users').where({id})
    .then(user => {
      if(user.length) {
        res.json(user[0])
      } else {
        res.status(400).json('User Not Found')
      }
    }).catch(err => res.status(400).json('Error getting user info'))
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0])
    }).catch(err => res.status(400).json('Unable to get entries'))
})


app.post('/signin', (req, res) => {
  const { email, password } = req.body
    if(!email || !password) {
      return res.status(400).json('Empty Submission')
    }

    db.select('email', 'hash').from('login')
      .where('email', '=', req.body.email)
      .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash)
        if(isValid) {
          return  db.select('*').from('users')
                    .where('email', '=', email)
                    .then(user => res.json(user[0]))
                    .catch(err => res.status(400).json('Unable to sign in'))
        } else {
          res.status(400).json('Invalid Credentials')
        }
      })
      .catch(err => res.status(400).json('Invalid Credentials'))
})

app.post('/register', (req, res) => {
    const { email, name, password } = req.body
    if(!email || !name || !password) {
      return res.status(400).json('Empty Submission')
    }
    const hash = bcrypt.hashSync(password, saltRounds)
    db.transaction(trx => {
      trx.insert({
        email: email,
        hash: hash
      }).into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
              email: loginEmail[0],
              name: name,
              joined: new Date()
          }).then(user => {
              res.json(user[0])
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('Unable to register'))
})



app.listen(5000, () => {
    console.log('app is running on port 5000');
})

const express = require('express');
const { connectToMongoDB } = require('./db');
const bcrypt = require('bcrypt')
const passport = require('passport')
const TravelCollectionController = require('./controller');
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
require('dotenv').config();


const app = express();
const PORT = 3000;

app.use('/views', express.static(__dirname + '/views'));
app.set('view engine', 'ejs');

const initializePassport = require('./passport_config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: '655b66a8c5fdaf440a890b0d',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/landingpage',
  failureRedirect: '/login',
  failureFlash: true
}), (req, res) => {
  req.flash('error', 'Invalid username or password'); 
  res.redirect('/login');
});

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('pages/register')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login'); 
  } catch {
    res.redirect('/register'); 
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

// index page
app.get('/', function(req, res) {
    res.render('pages/landingpage');
  });

  app.get('/login', function(req, res) {
    res.render('pages/login');
  });

  app.get('/register', function(req, res) {
    res.render('pages/register');
  });

  app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    res.send(`User registered successfully. Username: ${username}, Email: ${email}`);
});

  app.get('/ticket_booking', (req, res) => {
    res.render('pages/ticket_booking'); 
  });

  app.get('/tourist_guide_booking', (req, res) => {
    res.render('pages/tourist_guide_booking'); 
  });

  app.get('/hotel_booking', (req, res) => {
    res.render('pages/hotel_booking'); 
  });

// Connect to MongoDB
connectToMongoDB();

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running: http://localhost:${PORT}/`);
});

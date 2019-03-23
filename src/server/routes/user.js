import express from 'express';

const passport = require('passport');
const bcrypt = require('bcrypt');
const Users = require('../models/users');
const authenticationMiddleware = require('../authentication/middleware');

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

const router = express.Router();


function renderWelcome(req, res) {
  res.render('welcome');
}

function renderProfile(req, res) {
  res.render('profile', {
    username: req.user.username
  });
}


router.get('/login', renderWelcome);
router.get('/profile', authenticationMiddleware(), renderProfile);
router.get('/auth/facebook', passport.authenticate('facebook'));
debugger;
router.post('/login', passport.authenticate('local', {
  successRedirect: '/user/profile',
  failureRedirect: '/user/login'
}));
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/login'
  }));

router.post('/signup', async (req, res, next) => {
  try {
    const user = new Users({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, salt)
    });
    await user.save();
    req.session.user = user;
    res.redirect('/');
  } catch (error) {
    console.log(error.message);
    next(error);
  }
});

router.get('/signup', (req, res, next) => {
  res.render('signup', { user: req.session.user });
});

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});


export default router;

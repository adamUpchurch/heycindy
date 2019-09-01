var express = require('express');
var router = express.Router();
var User = require('../models/users');

var user = require('../controllers/users')
var twitter = require('../controllers/tweets')


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.session)

  res.render('index', { title: 'Express', isAuthenticated: req.session.isLoggedIn});
});

router.get('/dashboard', user.dashboard)

router.get('/profile', user.profile_get)
router.post('/profile', user.profile_post)

router.get('/register', user.register_get)
router.post('/register', user.register_post)

router.get('/login', user.login_get)
router.post('/login', user.login_post)

router.post('/logout', user.logout_post)

router.get('/user/:id/delete', user.delete_get)
router.post('/user/:id/delete', user.delete_post)

router.get('/user/:id/update', user.update_get)
router.post('/user/:id/update', user.update_post)

router.get('/user/:id', user.detail)
router.get('/users', user.list)

// Tweets
router.post('/find_tweets_by_phrase', twitter.find_tweets_by_phrase)
router.post('/create_friendship', twitter.create_friendship)
router.post('/create_favorite', twitter.create_favorite)
router.post('/create_retweet', twitter.create_retweet)


module.exports = router;

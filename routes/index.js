var express = require('express');
var router = express.Router();
var User = require('../models/users');
var stripe = require('stripe')

var user = require('../controllers/users')
var twitter = require('../controllers/tweets')


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.session)

  res.render('index', { title: 'Express', isHomePage: true, isAuthenticated: req.session.isLoggedIn});
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
router.post('/reply_to_tweet', twitter.reply_to_tweet)
router.post('/create_friendship', twitter.create_friendship)
router.post('/create_favorite', twitter.create_favorite)
router.post('/create_retweet', twitter.create_retweet)
router.post('/follow_random', twitter.follow_random)


router.post("/charge", (req, res) => {
  let amount = 500;
  console.log(stripe)

  stripe.customers.create({
     email: req.stripeEmail,
    source: req.body.stripeToken
  })
  .then(customer =>
    stripe.charges.create({
      amount,
      description: "Sample Charge",
         currency: "usd",
         customer: customer.id
    }))
  .then(charge => res.render("charge.pug"));
});


module.exports = router;

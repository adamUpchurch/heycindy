var express = require('express');
var router = express.Router();
const axios = require('axios');

var localTweets = require('../localTweets')
var user = require('../controllers/users')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
// User
router.get('/register', user.register_get)
router.post('/register', user.register_post)

router.get('/login', user.login_get)
router.post('/login', user.login_post)

router.get('/user/:id/delete', user.delete_get)
router.post('/user/:id/delete', user.delete_post)

router.get('/user/:id/update', user.update_get)
router.post('/user/:id/update', user.update_post)

router.get('/user/:id', user.detail)
router.get('/users', user.list)

// Tweets

router.post('/find_tweets_by_phrase', (req,res,next) => {
  console.log('find_tweets_by_phrase')
  axios.post('http://127.0.0.1:5000/find_tweets_by_phrase', {
    phrase: req.body.phrase
  })
  .then(function (response) {
    console.log(response.data);
    res.render('tweets', { title: 'Tweets', tweet_list: response.data });
  })
  .catch(function (error) {
    console.log(error);
  });
})

router.post('/create_friendship', (req,res,next) => {
  console.log(req.body)
  axios.post('http://127.0.0.1:5000/create_friendship', {
    follower_id: req.body.follower_id
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
})

router.post('/create_favorite', (req,res,next) => {
  console.log(req.body)
  axios.post('http://127.0.0.1:5000/create_favorite', {
    follower_id: req.body.tweet_id
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
})

router.post('/create_retweet', (req,res,next) => {
  console.log(req.body)
  axios.post('http://127.0.0.1:5000/create_retweet', {
    follower_id: req.body.tweet_id
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
})


module.exports = router;

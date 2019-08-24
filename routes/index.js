var express = require('express');
var router = express.Router();
var localTweets = require('../localTweets')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/find_tweets_by_phrase', (req,res,next) => {
  console.log('HEEEEEEY')
  res.render('tweets', { title: 'Tweets', tweet_list: localTweets });

})

module.exports = router;

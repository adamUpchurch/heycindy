var User = require('../models/users'),
    async   = require('async');
    bcrypt  = require('bcryptjs')
    _ = require("underscore");
    axios = require('axios');


// TODO: list, detail, create_get, create_post, delete_get, delete_post, update_get, update_post
module.exports = {
    list: (req, res, next) => {
        User.find()
            .sort([['family_name', 'ascending']])
            .exec((err, list_users)=> {
                if(err) { return next(err)}
                res.render('user_list', {title: 'Users', user_list: list_users, isAuthenticated: req.session.isLoggedIn})
            })
    },
    detail: (req, res, next) => {
        let id = req.params.id;
        async.parallel({
            user: (cb) => {
                User.findById(id)
                    .exec(cb)
            },
            // Replace startup with whatever other model that has a relationship with the user model
            // startup: function(cb){
            //     Startup.find({'user': id})
            //         .exec(cb)
            // },
        }, (err, result) => {
            if(err) { return next(err)}
            console.log(result)
            res.render('user_detail', {title: 'User', user: result.user, startups: result.startup, isAuthenticated: req.session.isLoggedIn})
        })
    },
    find_tweets_by_phrase: (req,res,next) => {
        User.findById(req.session.user._id, (err, user) => {
            if(err) {
                console.log(err)
            }
            if(user){
                console.log('find_tweets_by_phrase')
                console.log(user.twitterCredentials)
                axios.post('https://cindytweepy.herokuapp.com/find_tweets_by_phrase', {
                    phrase: req.body.phrase,
                    twitterCredentials: user.twitterCredentials
                })
                .then(function (response) {
                console.log(response.data);
                res.render('dashboard', { title: 'Dashboard', isAuthenticated: req.session.isLoggedIn, tweet_list: response.data})

                })
                .catch(function (error) {
                console.log(error);
                });
            } 
            else {
                res.redirect('/login')
            }
        })
    },
    create_friendship: (req,res,next) => {
        User.findById(req.session.user._id, (err, user) => {
            if(err) {
                console.log(err)
            }
            if(user){
                axios.post('https://cindytweepy.herokuapp.com/create_friendship', {
                    follower_id: req.body.follower_id,
                    twitterCredentials: user.twitterCredentials,
                  })
                  .then(function (response) {
                    console.log(response);
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
            } 
            else {
                console.log('No user found')
            }
        })
    },
    create_favorite: (req,res,next) => {
        User.findById(req.session.user._id, (err, user) => {
            if(err) {
                console.log(err)
            }
            if(user){
                axios.post('https://cindytweepy.herokuapp.com/create_favorite', {
                    tweet_id: req.body.tweet_id,
                    twitterCredentials: user.twitterCredentials,
                  })
                  .then(function (response) {
                    console.log(response);
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
            } 
            else {
                console.log('No user found')
            }
        })
      },
    create_retweet: (req,res,next) => {
        User.findById(req.session.user._id, (err, user) => {
            if(err) {
                console.log(err)
            }
            if(user){
                console.log('find_tweets_by_phrase')
                console.log(user.twitterCredentials)
                axios.post('https://cindytweepy.herokuapp.com/create_retweet', {
                    tweet_id: req.body.tweet_id,
                    twitterCredentials: user.twitterCredentials,
                  })
                  .then(function (response) {
                    console.log(response);
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
            } 
            else {
                console.log('No user found')
            }
        })
      },
    reply_to_tweet: (req,res,next) => {
    User.findById(req.session.user._id, (err, user) => {
        if(err) {
            console.log(err)
        }
        if(user){
            console.log('find_tweets_by_phrase')
            console.log(user.twitterCredentials)
            axios.post('https://cindytweepy.herokuapp.com/reply_to_tweet', {
                tweet_id: req.body.tweet_id,
                status: req.body.status,
                twitterCredentials: user.twitterCredentials,
                })
                .then(function (response) {
                console.log(response);
                })
                .catch(function (error) {
                console.log(error);
                });
        } 
        else {
            console.log('No user found')
        }
    })
    },
    follow_random: (req,res,next) => {
        const polarityMin =req.body.polarityMin / 100
        User.findById(req.session.user._id, (err, user) => {
            if(err) {
                console.log(err)
            }
            if(user){
                console.log('follow_random')
                console.log(user.twitterCredentials)
                axios.post('https://cindytweepy.herokuapp.com/follow_random', {
                    thatSaid: req.body.thatSaid,
                    atMost: req.body.atMost,
                    polarityMin,
                    twitterCredentials: user.twitterCredentials,
                    })
                    .then(function (response) {
                    console.log(response);
                    res.render('dashboard', { title: 'Dashboard', isAuthenticated: req.session.isLoggedIn, tweet_list: response.data})
                })
                    .catch(function (error) {
                    console.log(error);
                    res.redirect('/dashboard')
                    });
            } 
            else {
                console.log('No user found')
            }
        })
    },
}
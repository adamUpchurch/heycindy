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
                axios.post('http://127.0.0.1:5000/find_tweets_by_phrase', {
                    phrase: req.body.phrase,
                    twitterCredentials: user.twitterCredentials
                })
                .then(function (response) {
                console.log(response.data);
                res.render('tweets', { title: 'Tweets', tweet_list: response.data });
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
    },
    create_favorite: (req,res,next) => {
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
      },
    create_retweet: (req,res,next) => {
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
      },
}
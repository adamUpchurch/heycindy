var User = require('../models/users'),
    async   = require('async');
    bcrypt  = require('bcryptjs')
    _ = require("underscore");
    axios = require('axios');


const   { body,validationResult } = require('express-validator/check'),
        { sanitizeBody } = require('express-validator/filter');

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
    register_get: (req, res) => {
        res.render('register_form', {title: 'Register User', isRegistrationPage:true})
    },
    register_post: [
        // Validate that the name field is not empty.
        body('first_name', 'User name required').isLength({ min: 1 }).trim()
            .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
        body('family_name', 'User name required').isLength({ min: 1 }).trim()
            .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
        body('password', 'Password required').isLength({ min: 1 }).trim(),

        sanitizeBody('first_name').escape(),
        sanitizeBody('family_name').escape(),
        sanitizeBody('email').escape(),

        (req, res, next) => {
            console.log('Creating new user!')
            console.log(req.body)

            // Extract the validation errors from a request.
            const errors = validationResult(req);
            const newUser = req.body

            // using bCrypt to hash password
            var salt = bcrypt.genSaltSync(12);
            var hash = bcrypt.hashSync(req.body.password, salt)
        
            // Register a user object with escaped, trimmed data & hashed password
            var user = new User({
                first_name: newUser.first_name,
                family_name: newUser.family_name,
                email: newUser.email,
                password: hash,
                });

            // If error is not empty - so if there are errors - weird but this works
            if(!errors.isEmpty()) {
                //Error. Render form again with sanitized values/error message
                res.render('user_form', { title: 'Register User', user: user, errors: errors.array(), isAuthenticated: req.session.isLoggedIn});
                return;
            }

            // There are no errors!!
            else {
                // Data from form is valid
                user.save(err => {
                    if(err) {return next(err)}
                    res.redirect(user.url)
                })
            }
        }

    ],
    login_get: (req, res) => {
        console.log(req.session)
        res.render('log_in', {title: 'Register User', isLoginPage:true, isAuthenticated: req.session.isLoggedIn})
    },
    login_post: [
        (req, res, next) => {
            console.log('Trying to log in user!')
            // Extract the validation errors from a request.
            const errors = validationResult(req);
            

            const email = req.body.email
            console.log(req.body)
            if(!errors.isEmpty()) {
                //Error. Render form again with sanitized values/error message
                res.render('user_form', { title: 'Register User', user: user, errors: errors.array(), isAuthenticated: req.session.isLoggedIn});
                return;
            }
            else {
                // Find user by email
                User.findOne({email})
                .exec((error, user) => {
                    console.log(user)
                    if(_.isEmpty(user)) {
                        res.render('log_in', {error: 'Username or password is incorrect'})
                    }
                    console.log(user)
                    console.log('Comparing: ')
                    console.log(user.password)
                    console.log(req.body.password)
                    const thePasswordIsCorrect = bcrypt.compareSync(req.body.password, user.password);

                    if(thePasswordIsCorrect){
                        console.log('Loggin user in')
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        req.session.save(err => {
                            console.log(err)
                            return res.redirect('/dashboard')
                        })
                    } else {
                        console.log('incorrect password')
                        res.redirect('/login')
                    }
                })
            }
        }

    ],
    logout_post: (req, res) => {
        req.session.destroy(error => {
            console.log(error)
            res.render('index')
        })
    },
    delete_get: (req, res) => {
        async.parallel({
            user: (callback) => {
                User.findById(req.params.id).exec(callback)
            },
            // find anything else that is related before deleting 
            // startups: function(callback){
            //     Startup.find({'user': req.params.id}).exec(callback)
            // },
        }, (error, results) => {
            if(error) {return next(error)}
            if (results.user == null) {
                res.redirect('/catalog/users')
            }
            res.render('user_delete', {title: 'Delete User', user: results.user, startups: results.startups, isAuthenticated: req.session.isLoggedIn})
        })
    },
    delete_post: (req, res, next) => {
        async.parallel({
            user: (callback) => {
                User.findById(req.body.userid).exec(callback)
            },
        },  (error, results) => {
            if(error) {            
                return next(error)}
            else {
                User.findByIdAndRemove(req.body.userid, (error) => {
                    if(error) {                        
                        return next(error)
                    }
                    res.redirect('/catalog/users')
                })
            }
        })
    },
    update_get: (req, res) => {
        async.parallel({
            user: (callback) => {
                User.findById(req.params.id).exec(callback)
            },
            // find whatever else is related to the user
            // startups: function(callback){
            //     Startup.find({'user': req.params.id}).exec(callback)
            // },
        }, (error, results) => {
            if(error) {return next(error)}
            if (results.user == null) {
                res.redirect('/api/users')
            }
            res.render('user_form', {title: 'Update Author', user: results.user, startups: results.startups, isAuthenticated: req.session.isLoggedIn})
        })
    },
    update_post: [
            // Validate that the name field is not empty.
            body('first_name', 'User name required').isLength({ min: 1 }).trim()
                .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
            body('family_name', 'User name required').isLength({ min: 1 }).trim()
                .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    
            sanitizeBody('first_name').escape(),
            sanitizeBody('family_name').escape(),
            sanitizeBody('company_name').escape(),
            sanitizeBody('common_phrase').escape(),
            sanitizeBody('consumer_key').escape(),
            sanitizeBody('consumer_secret').escape(),
            sanitizeBody('access_token').escape(),
            sanitizeBody('access_token_secret').escape(),
    
            (req, res, next) => {
                console.log('Creating new user!')
                console.log(req.body)
                // Extract the validation errors from a request.
                const errors = validationResult(req);
                const newUser = req.body
                // Register a user object with escaped & trimmed data
                var user = new User(
                    { 
                    first_name: newUser.first_name,
                    family_name: newUser.family_name,
                    _id:req.params.id //This is required, or a new ID will be assigned!
                    });
    
                if(!errors.isEmpty()) {
                    //Error. Render form again with sanitized values/error message
                    res.render('user_form', { title: 'Register User', user: user, errors: errors.array(), isAuthenticated: req.session.isLoggedIn});
                    return;
                }
                else {
                    // Data from form is valid. Update the record.
                    User.findByIdAndUpdate(user._id, user, {}, (err,UpdatedUser) => {
                        if (err) { return next(err); }
                            // Successful - redirect to book detail page.
                            res.redirect(UpdatedUser.url);
                        });
                }
            }
        ],
    dashboard: (req, res) => {
        User.findById(req.session.user._id, (err, user) => {
            if(err) {
                console.log(err)
            }
            if(user){
                console.log('find_tweets_by_phrase')
                console.log(user.twitterCredentials)
                axios.post('https://cindytweepy.herokuapp.com/find_tweets_by_phrase', {
                    phrase: user.common_phrase,
                    twitterCredentials: user.twitterCredentials,
                    })
                    .then(function (response) {
                    console.log(response);
                    res.render('dashboard', { search_phrase: user.common_phrase, isAuthenticated: req.session.isLoggedIn, tweet_list: response.data})
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
    profile_get: (req, res) => {
        User.findById(req.session.user._id, (err, user) => {
            if(err) {
                console.log(err)
            }
            if(user){
                res.render('profile', {title: 'Profile', user: user, isAuthenticated: req.session.isLoggedIn})
            } 
            else {
                res.redirect('/login')
            }
        })
    },
    profile_post: [
        // Validate that the name field is not empty.
        body('first_name', 'User name required').isLength({ min: 1 }).trim()
            .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
        body('family_name', 'family name required').isLength({ min: 1 }).trim(),
        body('consumer_key', 'consume_key is required').isLength({ min: 1 }).trim(),
        body('consumer_secret', 'consumer_secret is required').isLength({ min: 1 }).trim(),
        body('access_token', 'access_token is required').isLength({ min: 1 }).trim(),
        body('access_token_secret', 'access_token_secret is required').isLength({ min: 1 }).trim(),

        sanitizeBody('first_name').escape(),
        sanitizeBody('family_name').escape(),
        sanitizeBody('company_name').escape(),
        sanitizeBody('common_phrase').escape(),
        sanitizeBody('email').escape(),
        sanitizeBody('consumer_key').escape(),
        sanitizeBody('consumer_secret').escape(),
        sanitizeBody('access_token').escape(),
        sanitizeBody('access_token_secret').escape(),

        (req, res, next) => {
            console.log('updating user information!')
            console.log(req.body)
            // Extract the validation errors from a request.
            const errors = validationResult(req);
            const user = req.body
            // Register a user object with escaped & trimmed data
            var updatedUser = new User({ 
                first_name: user.first_name,
                family_name: user.family_name,
                email: user.email,
                company_name: user.company_name,
                common_phrase: user.common_phrase,
                twitterCredentials: {
                    consumer_key: user.consumer_key,
                    consumer_secret: user.consumer_secret,
                    access_token: user.access_token,
                    access_token_secret: user.access_token_secret,
                },
                _id:req.session.user._id //This is required, or a new ID will be assigned!
            });
            if(!errors.isEmpty()) {
                //Error. Render form again with sanitized values/error message
                res.render('user_form', { title: 'Register User', user: user, errors: errors.array(), isLoginPage:true, isAuthenticated: req.session.isLoggedIn});
                return;
            }
            else {
                // Data from form is valid. Update the record.
                User.findByIdAndUpdate(req.session.user._id, updatedUser, {}, (err,UpdatedUser) => {
                    if (err) { return next(err); }
                        // Successful - redirect to book detail page.
                        res.redirect('/profile');
                    });
            }
        }
    ],
}
var User = require('../models/users'),
    async   = require('async');
    bcrypt  = require('bcryptjs')

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
            
            if(!errors.isEmpty()) {
                //Error. Render form again with sanitized values/error message
                res.render('user_form', { title: 'Register User', user: user, errors: errors.array(), isAuthenticated: req.session.isLoggedIn});
                return;
            }
            else {
                // Find user by email
                User.findOne({email})
                .exec((error, user) => {
                    if(error) res.redirect('/login')
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
                            return res.redirect('/')
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
}
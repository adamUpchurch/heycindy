var User = require('../models/users'),
    async   = require('async');

const   { body,validationResult } = require('express-validator/check'),
        { sanitizeBody } = require('express-validator/filter');

// TODO: list, detail, create_get, create_post, delete_get, delete_post, update_get, update_post
module.exports = {
    list: (req, res, next) => {
        User.find()
            .sort([['family_name', 'ascending']])
            .exec((err, list_users)=> {
                if(err) { return next(err)}
                res.render('user_list', {title: 'Users', user_list: list_users})
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
            res.render('user_detail', {title: 'User', user: result.user, startups: result.startup})
        })
        },
    register_get: (req, res) => {
        res.render('register_form', {title: 'Register User'})
    },
    register_post: [
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
            var user = new User({
                first_name: newUser.first_name,
                family_name: newUser.family_name,
                personality: newUser.personality
                });

            if(!errors.isEmpty()) {
                //Error. Render form again with sanitized values/error message
                res.render('user_form', { title: 'Register User', user: user, errors: errors.array()});
                return;
            }
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
        res.render('register_form', {title: 'Register User'})
    },
    login_post: [
        (req, res, next) => {
            console.log('Creating new user!')
            console.log(req.body)
            // Extract the validation errors from a request.
            const errors = validationResult(req);
            const newUser = req.body
            // Register a user object with escaped & trimmed data
            var user = new User({
                first_name: newUser.first_name,
                family_name: newUser.family_name,
                email: newUser.email
                });

            if(!errors.isEmpty()) {
                //Error. Render form again with sanitized values/error message
                res.render('user_form', { title: 'Register User', user: user, errors: errors.array()});
                return;
            }
            else {
                // Data from form is valid
                user.save(err => {
                    if(err) {return next(err)}
                    res.redirect(user.url)
                })
            }
        }

    ],
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
            res.render('user_delete', {title: 'Delete User', user: results.user, startups: results.startups})
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
            res.render('user_form', {title: 'Update Author', user: results.user, startups: results.startups})
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
                    res.render('user_form', { title: 'Register User', user: user, errors: errors.array()});
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
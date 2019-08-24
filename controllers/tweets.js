var async = require('async');
var marked = require('marked');

var Founder = require('../models/founder'),
    Startup = require('../models/startup'),
    Industry = require('../models/industry');    

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function(code) {
      return require('highlight.js').highlightAuto(code).value;
    },
    pedantic: true,
    headerIds: false,
    tables: true,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    xhtml: false
  });


module.exports = {
    index: (req, res) => {
        async.parallel({
            founder_count: function(cb) {
                Founder.countDocuments({}, cb)
            },
            startup_count: function(cb) {
                Startup.countDocuments({}, cb)
            },
            industry_count: function(cb) {
                Industry.countDocuments({}, cb)
            },
        }, function(err, results) {
            res.render('index', { title: 'startUp_athon', error: err, data: results });

        } 
        )
    },
    list: (req, res, next) => {
        Startup.find({})
            .populate('founder startup')
            .exec((err, list_startups) => {
                if (err) { return next(err); }
                
                res.render('startup_list', { title: 'Startup List', startup_list: list_startups})
            });
    },
    detail: (req, res) => {
        let id = req.params.id;
        Startup.findById(id)
            .populate('founder')
            .populate('industry')
            .exec((err, startup)=> {
                if (err) { return next(err); }
                console.log('Startup detail')
                console.log(startup)
                if(startup.businessplan){
                    var businessplan = marked(startup.businessplan)
                    console.log('Business Plan =====')
                    console.log(businessplan)
                }
                else {
                    var businessplan = 'No Business Plan'
                }
                res.render('startup_detail', { title: 'Startup Detail', startup, businessplan})
            })
    },
    create_get: (req, res, next) => {
        
        async.parallel({
            founders: function(callback){
                Founder.find(callback);
            },
            industries: function(callback){
                Industry.find(callback)
            },
        },  function(error, results){
                if(error) {return next(error)}
                res.render('startup_form', {title: 'Startup Form', founders:results.founders, industries: results.industries})
            }
            )
    },
    create_post: [
        (req, res, next) => {
            if(!(req.body.founder instanceof Array)){
                if(typeof req.body.founder === 'undefined')
                    req.body.founder=[];
                else
                    req.body.founder = new Array(req.body.founder);
            }
            next();
        },
        // Validate fields
        body('title', 'Title must not be empty').isLength({min: 1}).trim(),
        body('summary', 'Summary must not be empty').isLength({min: 1}).trim(),
        body('businessplan', 'Business plan must not be empty').isLength({min: 1}).trim(),

        //Sanitize
        sanitizeBody('title').escape(),
        sanitizeBody('founder.*').escape(),
        sanitizeBody('summary').escape(),
        sanitizeBody('industry').escape(),
        sanitizeBody('businessplan').escape(),

        (req, res, next) => {
            const errors = validationResult(req);

            // Create a Startup Project
            //Create a Startup object with escaped/trimmed data and old id
            var startup = new Startup({
                title: req.body.title,
                summary: req.body.summary,
                industry: req.body.industry,
                status: req.body.status,
                businessplan: req.body.businessplan,
                founder: req.body.founder,
            });
            if(!errors.isEmpty()) {
                //Error. Render form again with sanitized values/error message
                res.render('startup_form',  { title: 'Create Startup', startup: startup, errors: errors.array()})
                return;
            }
            else {
                // Data from form is valid
                console.log(startup)
                startup.save(err => {
                    if(err) {return next(err)}
                    res.redirect(startup.url)
                })
            }
        }
    ],
    delete_get: (req, res) => {
        async.parallel({
            startup: callback => {
                Startup.findById(req.params.id).populate('founder industry').exec(callback)
            },
        }, (error, results) => {
            if(error) return next(error);
            console.log(results)
            if(results.startup == null) res.redirect('/catalog/startups')
            res.render('startup_delete', {title: 'Delete Startup', startup: results.startup})
        })
    },
    delete_post: (req, res) => {
        async.parallel({
            startup: callback => {
                Startup.findById(req.body.startupid).exec(callback)
            }
        }, (error, results) => {
            if(error) return next(error)
            Startup.findByIdAndRemove(req.body.startupid, function deleteStartup(error) {
                if(error) return next(error)
                res.redirect('/catalog/startups')
            })
        })
    },
    update_get: (req, res) => {
        async.parallel({
            founder: function(callback){
                Founder.find(callback)
            },
            industry: function(callback){
                Industry.find(callback)
            },
            startup: function(callback){
                Startup.findById(req.params.id).populate('founder').populate('industries').exec(callback)
            },
        },
            function(error, results){
                if(error) { return next(error)}
                if (results.startup == null) { // No startup to return
                    var err = new Error('Startup not found')
                    err.status = 404;
                    return next(err)
                }
                //Success
                // Mark our selected industries as checked.
                for (var all_founder_inter = 0; all_founder_inter < results.founder.length; all_founder_inter++){

                    for (var startup_founder_inter = 0; startup_founder_inter < results.startup.founder.length; startup_founder_inter++){
                    
                        if(results.founder[all_founder_inter]._id.toString()==results.startup.founder[startup_founder_inter]._id.toString()) {
                            results.founder[all_founder_inter].checked='true'
                        }
                    }
                }
                // res.json(results)
                res.render('startup_form', {title: 'Update Startup', founders: results.founder, industries: results.industry, startup: results.startup})
            })
    },
    update_post: [
        (req, res, next) => {
            console.log(req.body)
            if(!(req.body.founder instanceof Array)){
                if(typeof req.body.founder==='undefined')
                    req.body.founder=[];
                else
                    req.body.founder = new Array(req.body.founder);
            }
            next();
        },
        // Validate fields
        body('title', 'Title must not be empty').isLength({min: 1}).trim(),
        body('summary', 'Summary must not be empty').isLength({min: 1}).trim(),
        body('businessplan', 'Business plan must not be empty').isLength({min: 1}).trim(),

        //Sanitize
        sanitizeBody('title').escape(),
        sanitizeBody('founder.*').escape(),
        sanitizeBody('summary').escape(),
        sanitizeBody('industry').escape(),
        sanitizeBody('businessplan').escape(),

        // Process request after validation and sanitization
        (req, res, next) => {
            const errors = validationResult(req);
            console.log('errors: ' + errors)
            //Create a Startup object with escaped/trimmed data and old id
            console.log('POSTING UPDATE')
            console.log(req.body)
            var startup = new Startup({
                title: req.body.title,
                summary: req.body.summary,
                industry: req.body.industry,
                status: req.body.status,
                founder: req.body.founder,
                businessplan: req.body.businessplan,
                _id: req.params.id //This is required, or a new ID will be assigned.
            });
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized value/error messages

            // Get all Founders and Industries for form
            async.parallel({
                founders: function(callback) {
                    Founder.find(callback)
                },
                industry: function(callback) {
                    Industry.find(callback)
                },
            }, function(error, results) {
                if (error) {return next(error)}
                // Mark selected our founders as checked
                for (let i = 0; i < results.founders.length; i++) {
                    if (startup.founder.indexOf(results.founders[i]._id) > -1) {
                        results.founders[i].checked='true';
                    }
                }
                res.render('startup_form', {title: 'Update Startup', founders: results.founders, industries: results.industry, startup: startup, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record
            Startup.findByIdAndUpdate(startup._id, startup, {}, function(error, thestartup) {
                if(error) {return next(error)}
                // Update successful - redirect to startup detail
                res.redirect(thestartup.url)
            })
        }
        }
    ]
}
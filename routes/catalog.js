var express = require('express');
var router = express.Router();

var user = require('../controllers/users')


// User
router.get('/user/create', user.create_get)
router.post('/user/create', user.create_post)

router.get('/user/:id/delete', user.delete_get)
router.post('/user/:id/delete', user.delete_post)

router.get('/user/:id/update', user.update_get)
router.post('/user/:id/update', user.update_post)

router.get('/user/:id', user.detail)
router.get('/users', user.list)

module.exports = router;

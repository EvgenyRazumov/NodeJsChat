var express = require('express');
var router = express.Router();
var appStorage = require('../appstorage');

router.get('/', checkAuth, function(req, res, next) {
  res.render('Chat/index', { title: 'Chat room', activeUsers: appStorage.getActiveUserNames(req.user) });
});

router.get('/loadPrivateMessages', checkAuth, function(req, res, next) {
  res.json(appStorage.loadPrivateMessages(req.user, req.query.user));
});

//Used to check if user is authorized
function checkAuth(req, res, next) {
  if (!req.session.user) {
    var error = new Error("Unauthorized access");
    error.status = 403;
    next(error);
  } else {
    next();
  }
}

module.exports = router;

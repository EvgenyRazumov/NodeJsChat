var express = require('express');
var router = express.Router();
var appStorage = require('../appstorage');

router.get('/', function(req, res, next) {
  'use strict';
  res.render('Home/index',
      {
        title: 'Home page',
        username: '',
        errors: null
      });
});

router.post('/', function (req, res, next) {
  'use strict';
  req.assert('username', 'Name is required').notEmpty();
  var errors = req.validationErrors();
  var username = req.body.username;

  if (!errors) {
    //can be moved to separate module `authentication`
    if (!appStorage.isUserSignedIn(username)) {
      appStorage.signInUser(username);
      req.session.user = username;
      res.locals.user = username;
    } else {
      errors = [{ param: "username", msg: "User with specified name already has been signed in", value: username }];
    }
  }

  if (errors) {
    res.render('Home/index',
        {
          title: 'Home page',
          username: username,
          errors: errors
        });
  } else {
    res.redirect('/chat');
  }
});

router.post('/sign-out', function (req, res, next) {
  appStorage.signOutUser(req.user);
  req.session.destroy();
  res.redirect('/');
})

module.exports = router;

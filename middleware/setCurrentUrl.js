module.exports = function (req, res, next) {
    'use strict';
    res.locals.currentUrl = req.originalUrl;
    next();
}


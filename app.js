'use strict';
const debug = require('debug');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const config = require('./config/config');

const azureMobileApps = require('azure-mobile-apps');

const routes = require('./routes/index');
const users = require('./routes/users');
const recipes = require('./routes/recipes');
const ingredients = require('./routes/ingredients');
const units = require('./routes/units');

app.use(logger(config.env));
app.use(bodyParser.raw());

app.use('/insecure/', routes.insecure);
app.use('/insecure/users', users.insecure);
app.use('/insecure/recipes', recipes.insecure);
app.use('/insecure/ingredients', ingredients.insecure);
app.use('/insecure/units', units.insecure);
app.use('/static', express.static('static'))

app.use(function (req, res, next) {
    const authHeader = req.headers.authorization
    if (authHeader || config.env == 'dev') {
        next()
    } else {
        res.status(401).send('Unauthorized')
    }
})

app.use('/secure', routes.secure);
app.use('/secure/users', users.secure);
app.use('/secure/recipes', recipes.secure);
app.use('/secure/ingredients', ingredients.secure);
app.use('/secure/units', units.secure);

// catch 404 and forward to error handler
app.use(function (_, __, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.set('port', process.env.PORT || 1337);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});

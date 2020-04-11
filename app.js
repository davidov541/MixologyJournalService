'use strict';
const debug = require('debug');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const config = require('./config/config')

const routes = require('./routes/index');
const users = require('./routes/users');
const recipes = require('./routes/recipes');
const ingredients = require('./routes/ingredients')
const units = require('./routes/units');

const app = express();

app.use(logger(config.env));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res, next) {
    const authHeader = req.headers.authorization
    if (authHeader || config.env == 'dev' || req.url.startsWith('/static')) {
        next()
    } else {
        res.status(401).send('Unauthorized')
    }
})

app.use('/', routes);
app.use('/users', users);
app.use('/recipes', recipes);
app.use('/ingredients', ingredients);
app.use('/units', units);
app.use('/static', express.static('static'))

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

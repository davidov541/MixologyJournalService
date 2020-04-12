'use strict';
var express = require('express');

var insecureRouter = express.Router();
insecureRouter.get('/', function (req, res) {
    res.send('Hello User!');
});

var secureRouter = express.Router();
secureRouter.get('/', function (req, res) {
    res.send('Hello User!');
});

exports.insecure = insecureRouter;
exports.secure = secureRouter;

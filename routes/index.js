'use strict';
var express = require('express');
var insecureRouter = express.Router();

insecureRouter.get('/', function (_, res) {
    res.send("Hello World")
});

var secureRouter = express.Router();

secureRouter.get('/', function (_, res) {
    res.send("Hello World")
});

exports.insecure = insecureRouter;
exports.secure = secureRouter;
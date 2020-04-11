'use strict';
var express = require('express');
var router = express.Router();

router.get('/', function (_, res) {
    res.send("Hello World")
});

module.exports = router;

'use strict';
const express = require('express');
const { uuid } = require('uuidv4');

const cosmos = require('../util/cosmos')

const insecureRouter = express.Router();
insecureRouter.get('/', async function (req, res) {
    console.log('Running List Ingredients');

    try {
        const info = await cosmos.getEntriesOfKind('ingredient', ['name'])
        res.send(info);
    } catch (err) {
        res.status(500).send("Error found: " + err);
        console.log(err)
    }
});

const secureRouter = express.Router();
secureRouter.post('/create', async function (req, res) {
    console.log('Running Create Ingredient');

    const info = {
        name: req.body.name
    }
    const id = uuid()

    try {
        await cosmos.createEntryOfKind('ingredient', id, info, [])
        info.id = id
        res.send(info);
    } catch (err) {
        res.status(500).send("Error found: " + err);
        console.log(err)
    }
})

exports.insecure = insecureRouter;
exports.secure = secureRouter;

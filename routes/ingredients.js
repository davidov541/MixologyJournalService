'use strict';
const express = require('express');
const router = express.Router();
const { uuid } = require('uuidv4');

const cosmos = require('../util/cosmos')

router.get('/', async function (req, res) {
    console.log('Running List Ingredients');

    try {
        const info = await cosmos.getEntriesOfKind('ingredient', ['name'])
        res.send(info);
    } catch (err) {
        res.status(500).send("Error found: " + err);
        console.log(err)
    }
});

router.post('/create', async function (req, res) {
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

module.exports = router;

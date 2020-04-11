'use strict';
const express = require('express');
const router = express.Router();
const { uuid } = require('uuidv4');

const cosmos = require('../util/cosmos')

router.get('/', async function (_, res) {
    console.log('Running List Recipes');

    try {
        const info = await cosmos.getEntriesOfKind('recipe', ['name', 'steps'])
        info.forEach(i => i.steps = JSON.parse(i.steps))
        res.send(info);
    } catch (err) {
        res.status(500).send("Error found: " + err);
        console.log(err)
    }
});

router.post('/create', async function (req, res) {
    console.log('Running Create Recipe');

    try {
        const ingredients = req.body.ingredients
        var ingredientUsage = 1;
        const ingredientIDPromises = ingredients.map(async i => {
            const info = {
                name: `${req.body.name} Ingredient Usage #${ingredientUsage++}`
            };
            const id = uuid();
            const ingredientEdge = {
                id: i.ingredientID,
                relationship: "of",
                properties: {}
            }
            const unitEdge = {
                id: i.unitID,
                relationship: "amount",
                properties: {
                    unitAmount: i.unitAmount
                }
            }
            const ingredientUsageEdges = [ingredientEdge, unitEdge]
            await cosmos.createEntryOfKind('ingredientUsage', id, info, ingredientUsageEdges);
            return {
                id: id,
                relationship: "uses",
                properties: {}
            };
        })

        const ingredientIDs = await Promise.all(ingredientIDPromises)

        const info = {
            name: req.body.name,
            steps: JSON.stringify(req.body.steps)
        }
        const recipeID = uuid()
        await cosmos.createEntryOfKind('recipe', recipeID, info, ingredientIDs)
        info.id = recipeID
        info.steps = JSON.parse(info.steps)
        res.send(info);
    } catch (err) {
        res.status(500).send("Error found: " + err);
        console.log(err)
    }
})

module.exports = router;

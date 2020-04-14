'use strict';
const express = require('express');
const { uuid } = require('uuidv4');

const cosmos = require('../util/cosmos')

const insecureRouter = express.Router();
insecureRouter.get('/', async function (_, res) {
    console.log('Running List Recipes');

    try {
        const info = await cosmos.getEntriesOfKind('recipe', ['name', 'steps'])
        const infoPromises = info.map(processRecipe)
        const recipes = await Promise.all(infoPromises)
        res.send(recipes);
    } catch (err) {
        res.status(500).send("Error found: " + err);
        console.log(err)
    }
});

async function processRecipe(recipe) {
    recipe.steps = JSON.parse(recipe.steps)
    const usages = await cosmos.getConnectedEntriesOfKind(recipe.id, 'ingredientUsage', [])
    const usagesPromises = usages.map(processIngredientUsages)
    recipe.ingredients = await Promise.all(usagesPromises);
    return recipe;
}

async function processIngredientUsages(usage) {
    const ingred = {}
    const unit = (await cosmos.getConnectedEntriesOfKind(usage.id, 'unit', ['name'], ['unitAmount']))[0]
    ingred.unit = unit.vertex.name;
    ingred.amount = unit.edge.unitAmount;
    const ingredient = (await cosmos.getConnectedEntriesOfKind(usage.id, 'ingredient', ['name']))[0]
    ingred.ingredient = ingredient.vertex.name;
    return ingred;
}

const secureRouter = express.Router();
secureRouter.post('/create', async function (req, res) {
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

exports.insecure = insecureRouter;
exports.secure = secureRouter;

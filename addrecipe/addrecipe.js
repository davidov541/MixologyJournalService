const { uuid } = require('uuidv4');

const cosmos = require('../util/cosmos')

module.exports = async function (context, req) {
    context.log('POST /secure/recipes');
    
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
            context.log("Ingredient ID " + id + " starting")
            await cosmos.createEntryOfKind('ingredientUsage', id, info, ingredientUsageEdges);
            context.log("Ingredient ID " + id + " completed")
            return {
                id: id,
                relationship: "uses",
                properties: {}
            };
        })

        context.log("Waiting on all ingredient IDs")
        const ingredientIDs = await Promise.all(ingredientIDPromises)
        context.log("All ingredient IDs accounted for: " + JSON.stringify(ingredientIDs))

        const info = {
            name: req.body.name,
            steps: JSON.stringify(req.body.steps)
        }
        const recipeID = uuid()
        context.log("Starting creation of recipe vertex")
        await cosmos.createEntryOfKind('recipe', recipeID, info, ingredientIDs)
        context.log("Recipe vertex created")
        info.id = recipeID
        info.steps = JSON.parse(info.steps)
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: info
        };
    } catch (err) {
        console.log(err)
        context.res = {
            status: 500,
            body: "Error found: " + err
        };
    }
};
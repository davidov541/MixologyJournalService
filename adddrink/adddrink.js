const { uuid } = require('uuidv4');

const cosmos = require('../util/cosmos')

module.exports = async function (context, req) {
    context.log('POST /secure/drinks');

    const secret = process.env.APP_SECRET;

    try {
        if (!req.headers.hasOwnProperty('app-secret')) {
            context.res = {
                status: 401,
                body: "Must be authorized to use this API."
            }
        } else if (req.headers['app-secret'] != secret) {
            context.res = {
                status: 401,
                body: "Invalid credentials."
            }
        } else {
            const ingredients = req.body.ingredients
            var ingredientUsage = 1;
            const ingredientIDPromises = ingredients.map(async i => {
                const info = {
                    name: `${req.body.name} Instance Ingredient Usage #${ingredientUsage++}`
                };
                const id = uuid();
                const ingredientEdge = {
                    id: i.ingredient.id,
                    relationship: "of",
                    properties: {}
                }
                const unitEdge = {
                    id: i.unit.id,
                    relationship: "amount",
                    properties: {
                        unitAmount: i.amount
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
                name: "Drink - " + req.body.name,
                steps: JSON.stringify(req.body.steps)
            }
            const drinkID = uuid()
            await cosmos.createEntryOfKind('drink', drinkID, info, ingredientIDs)
            info.id = drinkID
            info.steps = JSON.parse(info.steps)

            const recipeID = req.body.sourceRecipeID
            cosmos.createEdge(drinkID, recipeID, 'derived from', {});
            cosmos.createEdge(recipeID, drinkID, 'derivative', {});

            const rootID = 'ef5375ad-6d92-4571-a999-999aa494ff13';
            await cosmos.createEdge(rootID, drinkID, 'created', {});
            await cosmos.createEdge(drinkID, rootID, 'created by', {});

            context.res = {
                // status: 200, /* Defaults to 200 */
                body: info
            };    
        }
    } catch (err) {
        console.log(err)
        context.res = {
            status: 500,
            body: "Error found: " + err
        };
    }
};
const { uuid } = require('uuidv4');

const cosmos = require('../util/cosmos')

module.exports = async function (context, req) {
    context.log('POST /secure/recipes');

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
                    name: `${req.body.name} Ingredient Usage #${ingredientUsage++}`
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
                name: req.body.name,
                steps: JSON.stringify(req.body.steps)
            }
            const recipeID = uuid()
            await cosmos.createEntryOfKind('recipe', recipeID, info, ingredientIDs)
            info.id = recipeID
            info.steps = JSON.parse(info.steps)

            const rootID = 'ef5375ad-6d92-4571-a999-999aa494ff13';
            await cosmos.createEdge(rootID, recipeID, 'created', {});
            await cosmos.createEdge(recipeID, rootID, 'created by', {});

            const finalResult = entityConversion.processRecipe(getAllDescendentsOfEntity(recipeID));

            context.res = {
                // status: 200, /* Defaults to 200 */
                body: finalResult
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
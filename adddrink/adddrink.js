const { uuid } = require('uuidv4');

const cosmos = require('../util/cosmos')
const entityConversion = require('../util/entityConversion')
const security = require('../util/security')

module.exports = async function (context, req) {
    context.log('POST /secure/drinks');

    const securityResult = security.checkToken(context, req);

    if (!securityResult.success)
    {
        context.res = {
            status: securityResult.error.code,
            body: securityResult.error.message
        }
    } else {
        try {
            context.log("Request: " + JSON.stringify(req));
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
                name: req.body.name,
                // Need steps to be a string for the create entry call.
                steps: JSON.stringify(req.body.steps)
            }
            const drinkID = uuid()
            await cosmos.createEntryOfKind('drink', drinkID, info, ingredientIDs)
            info.id = drinkID

            const recipeID = req.body.sourceRecipeID
            cosmos.createEdge(drinkID, recipeID, 'derived from', {});
            cosmos.createEdge(recipeID, drinkID, 'derivative', {});

            const userID = security.isAdmin(securityResult.user) ? process.env.ROOT_USER : securityResult.user.payload.sub;
            await cosmos.createEdge(userID, drinkID, 'created', {});
            await cosmos.createEdge(drinkID, userID, 'created by', {});

            const finalResult = entityConversion.processDrink(await cosmos.getAllDescendentsOfEntity(drinkID));

            context.res = {
                // status: 200, /* Defaults to 200 */
                body: finalResult
            };    
        } catch (err) {
            console.log(err)
            context.res = {
                status: 500,
                body: "Error found: " + err
            };
        }
    } 
};
const { uuid } = require('uuidv4');

const cosmos = require('../util/cosmos')
const entityConversion = require('../util/entityConversion')
const security = require('../util/security')

module.exports = async function (context, req) {
    context.log('POST /secure/recipes');
    
    const securityResult = security.checkToken(context, req);

    if (!securityResult.success)
    {
        context.res = {
            status: securityResult.error.code,
            body: securityResult.error.message
        }
    } else {
        try {
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

            const userID = security.isAdmin(securityResult.user) ? process.env.ROOT_USER : securityResult.user.sub;
            await cosmos.createEdge(userID, recipeID, 'created', {});
            await cosmos.createEdge(recipeID, userID, 'created by', {});

            const finalResult = entityConversion.processRecipe(await cosmos.getAllDescendentsOfEntity(recipeID));

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
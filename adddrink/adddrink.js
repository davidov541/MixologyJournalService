const { uuid } = require('uuidv4');

const cosmos = require('../util/persistence')
const security = require('../util/security')

async function createUser(userId, userName) {
    const userExists = await cosmos.getPropertiesOfEntity(userId, [])
    if (!userExists.success)
    {
        await cosmos.createEntryOfKind('user', userId, {name: userName}, [])
    }
}

module.exports = async function (context, req) {
    context.log('POST /secure/drinks');

    const securityResult = await security.checkToken(context, req);

    if (!securityResult.success)
    {
        context.res = {
            status: securityResult.error.code,
            body: securityResult.error.message
        }
    } else {
        try {
            await createUser(securityResult.user.payload.sub, securityResult.user.payload.name)

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
                steps: encodeURIComponent(JSON.stringify(req.body.steps))
            }
            const drinkID = uuid()
            await cosmos.createEntryOfKind('drink', drinkID, info, ingredientIDs)
            info.id = drinkID

            const recipeID = req.body.sourceRecipeID
            cosmos.createEdge(drinkID, recipeID, 'derived from', {});
            cosmos.createEdge(recipeID, drinkID, 'derivative', {});

            const userID = securityResult.user.payload.sub;
            await cosmos.createEdge(userID, drinkID, 'created', {});
            await cosmos.createEdge(drinkID, userID, 'created by', {});

            console.log("Review = " + req.body.review);
            const reviewInfo = {
                name: req.body.name,
                rating: req.body.rating,
                review: encodeURIComponent(JSON.stringify(req.body.review).slice(1, -1))
            }
            const reviewID = uuid();
            const reviewEdges = [{
                id: drinkID,
                relationship: "reviews",
                properties: {}
            }]
            await cosmos.createEntryOfKind('review', reviewID, reviewInfo, reviewEdges);
            await cosmos.createEdge(drinkID, reviewID, 'review of', {});

            context.res = {
                // status: 200, /* Defaults to 200 */
                body: "Success"
            };    
        } catch (err) {
            console.log(err)
            context.res = {
                status: 500,
                body: `Error found: ${err}`
            };
        }
    } 
};
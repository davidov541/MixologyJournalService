const { uuid } = require('uuidv4');

const versioning = require('./versioning')

const cosmos = require('../util/persistence')
const security = require('../util/security')

async function createUser(userId, userName) {
    const userExists = await cosmos.getPropertiesOfEntity(userId, [])
    if (!userExists.success)
    {
        return [cosmos.queueCreateEntry('user', userId, {name: userName}, [])]
    }
    return []
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
            var mutations = await createUser(securityResult.user.payload.sub, securityResult.user.payload.name)

            const body = versioning.migrateRequestToLatestVersion(req.body, req.headers["apiversion"]);

            const ingredients = body.ingredients
            var ingredientUsage = 1;
            const ingredientIDs = ingredients.map(i => {
                const info = {
                    name: `${body.name} Instance Ingredient Usage #${ingredientUsage++}`
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
                mutations.push(cosmos.queueCreateEntry('ingredientUsage', id, info, ingredientUsageEdges));
                return {
                    id: id,
                    relationship: "uses",
                    properties: {}
                };
            })
        
            const info = {
                name: body.name,
                // Need steps to be a string for the create entry call.
                steps: encodeURIComponent(JSON.stringify(body.steps))
            }
            const drinkID = uuid()
            mutations.push(cosmos.queueCreateEntry('drink', drinkID, info, ingredientIDs));

            const recipeID = body.basisRecipe
            mutations.push(cosmos.queueCreateEdge(drinkID, recipeID, 'derived from', {}));
            mutations.push(cosmos.queueCreateEdge(recipeID, drinkID, 'derivative', {}));

            const userID = securityResult.user.payload.sub;
            mutations.push(cosmos.queueCreateEdge(userID, drinkID, 'created', {}));
            mutations.push(cosmos.queueCreateEdge(drinkID, userID, 'created by', {}));

            const reviewInfo = {
                name: body.name,
                rating: body.rating,
                review: encodeURIComponent(JSON.stringify(body.review).slice(1, -1))
            }
            const reviewID = uuid();
            const reviewEdges = [{
                id: drinkID,
                relationship: "reviews",
                properties: {}
            }]
            mutations.push(cosmos.queueCreateEntry('review', reviewID, reviewInfo, reviewEdges));
            mutations.push(cosmos.queueCreateEdge(drinkID, reviewID, 'review of', {}));

            await cosmos.submitMutations(mutations);

            context.res = {
                // status: 200, /* Defaults to 200 */
                body: {
                    message: "Success",
                    createdId: drinkID
                }
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
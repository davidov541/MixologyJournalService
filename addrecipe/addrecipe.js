const { uuid } = require('uuidv4');

const cosmos = require('../util/persistence')
const entityConversion = require('../util/entityConversion')
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
    context.log('POST /secure/recipes');
    
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
            
            const ingredients = req.body.ingredients
            var ingredientUsage = 1;
            const ingredientIDs = ingredients.map(i => {
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
                mutations.push(cosmos.queueCreateEntry('ingredientUsage', id, info, ingredientUsageEdges));
                return {
                    id: id,
                    relationship: "uses",
                    properties: {}
                };
            })

            var picPath = "creation-pics/default.png"
            if ('picture' in req.body)
            {
                picPath = req.body.picture
            }
            const info = {
                name: req.body.name,
                steps: JSON.stringify(req.body.steps),
                picPath: picPath
            }
            const recipeID = uuid()
            mutations.push(cosmos.queueCreateEntry('recipe', recipeID, info, ingredientIDs))

            const userID = security.isAdmin(securityResult.user) ? process.env.ROOT_USER : securityResult.user.payload.sub;
            mutations.push(cosmos.queueCreateEdge(userID, recipeID, 'created', {}));
            mutations.push(cosmos.queueCreateEdge(recipeID, userID, 'created by', {}));

            await cosmos.submitMutations(mutations);

            context.res = {
                // status: 200, /* Defaults to 200 */
                body: {
                    message: "Success",
                    createdId: recipeID
                }
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
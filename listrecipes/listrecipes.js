const cosmos = require('../util/persistence')
const entityConversion = require('../util/entityConversion')
const security = require('../util/security')

const rootId = "ef5375ad-6d92-4571-a999-999aa494ff13";

module.exports = async function (context, req) {
    context.log('GET /insecure/recipes');

    const securityResult = await security.checkToken(context, req);

    try {
        const info = await cosmos.getAllDescendentsOfKind('recipe')

        var recipes = new Array();
        for(recipe in info) {
            const recipeInfo = entityConversion.processRecipe(info[recipe], securityResult.user);
            if (recipeInfo.user == rootId || 
                (securityResult.success && recipeInfo.user == securityResult.user.payload.sub))
            {
                recipes.push(recipeInfo);
            }
        }

        context.res = {
            status: 200,
            body: recipes
        };
    } catch (err) {
        console.log(err)
        context.res = {
            status: 500,
            body: "Error found: " + err
        };
    }
};
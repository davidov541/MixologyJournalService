const cosmos = require('../util/cosmos')
const entityConversion = require('../util/entityConversion')
const security = require('../util/security')

module.exports = async (context, req) => {
    context.log('GET /insecure/recipes');

    const securityResult = security.checkToken(context, req);

    if (!securityResult.success)
    {
        context.res = {
            status: securityResult.error.code,
            body: securityResult.error.message
        }
    } else {
        try {
            const info = await cosmos.getAllDescendentsOfKind('recipe')
    
            var recipes = new Array();
            for(recipe in info) {
                recipes.push(entityConversion.processRecipe(info[recipe]));
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
    }
};
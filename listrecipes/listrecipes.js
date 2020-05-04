const cosmos = require('../util/cosmos')
const entityConversion = require('../util/entityConversion')

module.exports = async function (context, _) {
    context.log('GET /insecure/recipes');

    try {
        const info = await cosmos.getAllDescendentsOfKind('recipe')

        var recipes = new Array();
        for(recipe in info) {
            recipes.push(entityConversion.processRecipe(info[recipe]));
        }

        context.res = {
            // status: 200, /* Defaults to 200 */
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
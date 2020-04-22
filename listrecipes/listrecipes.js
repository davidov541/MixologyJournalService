const cosmos = require('../util/cosmos')

module.exports = async function (context, _) {
    context.log('GET /insecure/recipes');

    try {
        const info = await cosmos.getEntriesOfKind('recipe', ['name', 'steps'])
        const infoPromises = info.map(processRecipe)
        const recipes = await Promise.all(infoPromises)
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

async function processRecipe(recipe) {
    recipe.steps = JSON.parse(recipe.steps)
    const usages = await cosmos.getConnectedEntriesOfKind(recipe.id, 'ingredientUsage', [])
    const usagesPromises = usages.map(processIngredientUsages)
    recipe.ingredients = await Promise.all(usagesPromises);
    return recipe;
}

async function processIngredientUsages(usage) {
    const ingred = {}
    const unit = (await cosmos.getConnectedEntriesOfKind(usage.id, 'unit', ['name'], ['unitAmount']))[0]
    ingred.unit = unit.vertex.name;
    ingred.amount = unit.edge.unitAmount;
    const ingredient = (await cosmos.getConnectedEntriesOfKind(usage.id, 'ingredient', ['name']))[0]
    ingred.ingredient = ingredient.vertex.name;
    return ingred;
}
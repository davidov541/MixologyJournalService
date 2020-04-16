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
    console.log('Processing recipe ' + recipe.name);
    recipe.steps = JSON.parse(recipe.steps)
    const usages = await cosmos.getConnectedEntriesOfKind(recipe.id, 'ingredientUsage', [])
    const usagesPromises = usages.map(processIngredientUsages)
    recipe.ingredients = await Promise.all(usagesPromises);
    console.log('Finished processing recipe ' + recipe.name);
    return recipe;
}

async function processIngredientUsages(usage) {
    console.log('Processing ingredient usage ' + usage.id)
    const ingred = {}
    console.log('Processing units for ' + usage.id)
    const unit = (await cosmos.getConnectedEntriesOfKind(usage.id, 'unit', ['name'], ['unitAmount']))[0]
    console.log('Finished processing units for ' + usage.id)
    ingred.unit = unit.vertex.name;
    ingred.amount = unit.edge.unitAmount;
    console.log('Processing ingredient for ' + usage.id)
    const ingredient = (await cosmos.getConnectedEntriesOfKind(usage.id, 'ingredient', ['name']))[0]
    console.log('Finished processing ingredient for ' + usage.id)
    ingred.ingredient = ingredient.vertex.name;
    console.log('Finished processing ingredient usage for ' + usage.id)
    return ingred;
}
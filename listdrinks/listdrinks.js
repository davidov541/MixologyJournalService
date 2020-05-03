const cosmos = require('../util/cosmos')

module.exports = async function (context, _) {
    context.log('GET /insecure/drinks');

    try {
        const info = await cosmos.getEntriesOfKind('drink', ['name', 'steps'])
        const infoPromises = info.map(processDrink)
        const drinks = await Promise.all(infoPromises)
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: drinks
        };
    } catch (err) {
        console.log(err)
        context.res = {
            status: 500,
            body: "Error found: " + err
        };
    }
};

async function processDrink(drink) {
    drink.steps = JSON.parse(drink.steps)
    const usages = await cosmos.getConnectedEntriesOfKind(drink.id, 'ingredientUsage', [])
    const usagesPromises = usages.map(processIngredientUsages)
    drink.ingredients = await Promise.all(usagesPromises);
    const sourceRecipe = await cosmos.getConnectedEntriesOfKind(drink.id, 'recipe', [])[0]
    drink.sourceRecipeID = sourceRecipe.id;
    return drink;
}

async function processIngredientUsages(usage) {
    const ingred = {}
    const unit = (await cosmos.getConnectedEntriesOfKind(usage.id, 'unit', ['name'], ['unitAmount']))[0]
    ingred.unit = {}
    ingred.unit.name = unit.vertex.name;
    ingred.unit.id = unit.id;
    ingred.amount = unit.edge.unitAmount;
    const ingredient = (await cosmos.getConnectedEntriesOfKind(usage.id, 'ingredient', ['name']))[0]
    ingred.ingredient = {}
    ingred.ingredient.name = ingredient.vertex.name;
    ingred.ingredient.id = ingredient.id;
    return ingred;
}
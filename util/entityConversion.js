const cosmos = require('../util/cosmos');

async function processDrink(drink) {
    drink.steps = JSON.parse(drink.steps)
    const usages = await cosmos.getConnectedEntriesOfKind(drink.id, 'ingredientUsage', [])
    const usagesPromises = usages.map(processIngredientUsages)
    drink.ingredients = await Promise.all(usagesPromises);
    const sourceRecipes = await cosmos.getConnectedEntriesOfKind(drink.id, 'recipe', [])
    drink.sourceRecipeID = sourceRecipes[0].id;
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

exports.processDrink = processDrink;
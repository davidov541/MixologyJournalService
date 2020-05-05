const cosmos = require('../util/cosmos');

function processDrink(drink) {
    var result = {}
    
    result.id = drink.key.id;
    result.name = drink.key.properties.name[0].value
    result.steps = JSON.parse(drink.key.properties.steps[0].value)

    result.ingredients = new Array();
    for(ingredientUsageEdge in drink.value) {
        if (drink.value[ingredientUsageEdge].key.inVLabel == "ingredientUsage")
        {
            for (ingredientUsage in drink.value[ingredientUsageEdge].value)
            {
                result.ingredients.push(processIngredientUsages(drink.value[ingredientUsageEdge].value[ingredientUsage]));
            }
        }
    }
    return result;
}

function processRecipe(recipe) {
    var result = {}
    
    result.id = recipe.key.id;
    result.name = recipe.key.properties.name[0].value
    result.steps = JSON.parse(recipe.key.properties.steps[0].value)

    result.ingredients = new Array();
    for(ingredientUsageEdge in recipe.value) {
        if (recipe.value[ingredientUsageEdge].key.inVLabel == "ingredientUsage")
        {
            for (ingredientUsage in recipe.value[ingredientUsageEdge].value)
            {
                result.ingredients.push(processIngredientUsages(recipe.value[ingredientUsageEdge].value[ingredientUsage]));
            }
        }
    }
    return result;
}

function processIngredientUsages(usage) {
    var ingredient = {};
    var unit = {};
    var unitAmount = "";

    for (child in usage.value) {
        childVal = usage.value[child];
        if (childVal.key.inVLabel == "unit") 
        {
            unitAmount = childVal.key.properties.unitAmount;
            for (u in childVal.value) {
                unit = childVal.value[u];
            }
        } 
        else if (childVal.key.inVLabel == "ingredient")
        {
            for (i in childVal.value) {
                ingredient = childVal.value[i];
            }
        }
    }

    const ingred = {};

    ingred.unit = {};
    ingred.unit.name = unit.key.properties.name[0].value;
    ingred.unit.id = unit.key.id;
    ingred.amount = unitAmount;
    
    ingred.ingredient = {}
    ingred.ingredient.name = ingredient.key.properties.name[0].value;
    ingred.ingredient.id = ingredient.key.id;

    return ingred;
}

exports.processRecipe = processRecipe;
exports.processDrink = processDrink;
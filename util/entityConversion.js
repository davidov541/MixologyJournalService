function processDrink(drink) {
    var result = {}

    result.id = drink.key.id;
    result.name = drink.key.properties.name[0].value
    result.steps = JSON.parse(decodeURIComponent(drink.key.properties.steps[0].value))

    result.ingredients = new Array();
    for(edgeKey in drink.value) {
        const edge = drink.value[edgeKey];
        if (edge.key.inVLabel == "ingredientUsage")
        {
            for (ingredientUsageKey in edge.value)
            {
                const ingredientUsage = edge.value[ingredientUsageKey];
                result.ingredients.push(processIngredientUsages(ingredientUsage));
            }
        } 
        else if (edge.key.inVLabel == "user")
        {
            for (userKey in edge.value)
            {
                const user = edge.value[userKey];
                result.user = user.key.id;
            }
        }
        else if (edge.key.inVLabel == "review")
        {
            for (reviewKey in edge.value)
            {
                const review = edge.value[reviewKey];
                result.rating = review.key.properties.rating[0].value;
                result.review = JSON.parse('"' + decodeURIComponent(review.key.properties.review[0].value) + '"');
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
    for(edgeKey in recipe.value) {
        const edge = recipe.value[edgeKey];
        if (edge.key.inVLabel == "ingredientUsage")
        {
            for (ingredientUsage in edge.value)
            {
                result.ingredients.push(processIngredientUsages(edge.value[ingredientUsage]));
            }
        }
        else if (edge.key.inVLabel == "user")
        {
            for (userKey in edge.value)
            {
                const user = edge.value[userKey];
                result.user = user.key.id;
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
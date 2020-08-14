const adls = require('./adls')

function processDrink(drink) {
    var result = {}

    result.id = drink.key.id;
    result.name = drink.key.properties.name[0].value
    result.steps = JSON.parse(decodeURIComponent(drink.key.properties.steps[0].value))
    result.picture = {path: "creation-pics/default.png"}
    result.isFavorite = false;
    result.ingredients = new Array();
    result.basisRecipe = "Not Found";

    if ('picPath' in drink.key.properties)
    {
        result.picture.path = drink.key.properties.picPath[0].value
    }
    result.picture.url = adls.getSASForFile(result.picture.path)

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
        else if (edge.key.inVLabel == "recipe")
        {
            result.basisRecipe = edge.value[edge.key.inV].key.id;
            if (edge.key.label == 'favorite')
            {
                result.isFavorite = true;
            }
        }
    }
    return result;
}

function processRecipe(recipe) {
    var result = {}
    
    result.id = recipe.key.id;
    result.name = recipe.key.properties.name[0].value
    result.picture = {path: "creation-pics/default.png"}
    result.steps = JSON.parse(recipe.key.properties.steps[0].value)

    if ('picPath' in recipe.key.properties)
    {
        result.picture.path = recipe.key.properties.picPath[0].value
    }
    result.picture.url = adls.getSASForFile(result.picture.path)

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
    console.log("Processing ingredient usage: " + JSON.stringify(usage));
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

    if ('brand' in usage.key.properties)
    {
        ingred.brand = usage.key.properties.brand[0].value;
    }

    ingred.unit = processUnit(unit.key);
    ingred.ingredient = processIngredient(ingredient.key);
    ingred.amount = unitAmount;

    return ingred;
}

function processIngredient(ingredient)
{
    const ingred = {}
    ingred.name = ingredient.properties.name[0].value;
    ingred.id = ingredient.id;
    if ('plural' in ingredient.properties)
    {
        ingred.plural = ingredient.properties.plural[0].value;
    }
    else
    {
        ingred.plural = ingred.name;
    }
    return ingred;
}

function processUnit(unit) {
    const parsed = {}
    parsed.id = unit.id;
    parsed.name = unit.properties.name[0].value;
    parsed.plural = unit.properties.plural[0].value;
    parsed.format = unit.properties.format[0].value;
    return parsed;
}

exports.processRecipe = processRecipe;
exports.processDrink = processDrink;
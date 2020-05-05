const cosmos = require('../util/cosmos')
const entityConversion = require('../util/entityConversion')

module.exports = async function (context, _) {
    context.log('GET /insecure/drinks');

    try {
        const info = await cosmos.getAllDescendentsOfKind('drink')

        var drinks = new Array();
        for(drink in info) {
            drinks.push(entityConversion.processDrink(info[drink]));
        }

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
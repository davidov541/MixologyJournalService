const cosmos = require('../util/persistence')
const entityConversion = require('../util/entityConversion')
const security = require('../util/security')

module.exports = async function (context, req) {
    context.log('GET /insecure/drinks');

    const securityResult = await security.checkToken(context, req);


    try {
        const info = await cosmos.getAllDescendentsOfKind('drink')

        var drinks = new Array();
        for(drink in info) {
            const drinkInfo = entityConversion.processDrink(info[drink], securityResult.user);
            if (securityResult.success && drinkInfo.user == securityResult.user.payload.sub)
            {
                drinks.push(drinkInfo);
            }
        }

        context.res = {
            status: 200,
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
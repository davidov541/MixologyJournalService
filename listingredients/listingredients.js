const cosmos = require('../util/persistence')
const security = require('../util/security')

module.exports = async function (context, req) {
    context.log('GET /insecure/ingredients');

    const securityResult = await security.checkToken(context, req);

    try {
        const info = await cosmos.getEntriesOfKind('ingredient', ['name', 'plural'])
        context.log("Raw information from getEntriesOfKind: " + JSON.stringify(info));
        for (i in info) {
            const ingred = info[i]
            if (!('pural' in ingred))
            {
                info[i].plural = ingred.name;
            }
        }
        context.res = {
            status: 200,
            body: info
        };
    } catch (err) {
        console.log(err)
        context.res = {
            status: 500,
            body: "Error found: " + err
        };
    }
};
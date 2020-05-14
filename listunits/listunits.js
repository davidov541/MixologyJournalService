const cosmos = require('../util/persistence')
const security = require('../util/security')

module.exports = async function (context, req) {
    context.log('GET /insecure/units');

    const securityResult = await security.checkToken(context, req);

    try {
        const info = await cosmos.getEntriesOfKind('unit', ['name'])
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
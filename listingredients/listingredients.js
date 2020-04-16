const cosmos = require('../util/cosmos')

module.exports = async function (context, _) {
    context.log('GET /insecure/ingredients');

    try {
        const info = await cosmos.getEntriesOfKind('ingredient', ['name'])
        context.res = {
            // status: 200, /* Defaults to 200 */
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
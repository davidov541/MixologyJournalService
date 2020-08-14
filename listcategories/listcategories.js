const cosmos = require('../util/persistence')
const security = require('../util/security')

const getCategoriesQuery = "g.V().hasLabel('category')" +
".project('id', 'name', 'subcategories', 'ingredients')" +
".by('id')" +
".by('name')" +
".by(" +
    "out('subcategory')" +
    ".project('id', 'name', 'ingredients')" +
    ".by('id')" +
    ".by('name')" +
    ".by(" +
        "out('instance')" +
        ".project('id')" +
        ".by('id')" +
        ".select('id')" +
        ".fold())" +
    ".fold())" +
".by(" +
    "out('instance')" +
    ".project('id')" +
    ".by('id')" +
    ".select('id')" +
    ".fold())"

module.exports = async function (context, req) {
    context.log('GET /insecure/categories');

    const securityResult = await security.checkToken(context, req);

    try {
        const info = await cosmos.runCustomQuery(getCategoriesQuery)
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
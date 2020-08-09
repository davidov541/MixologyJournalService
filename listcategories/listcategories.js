const cosmos = require('../util/persistence')
const security = require('../util/security')

module.exports = async function (context, req) {
    context.log('GET /insecure/categories');

    const securityResult = await security.checkToken(context, req);

    try {
        const info = await cosmos.getEntriesAndRelated('category', 'subcategory', ['name'], ['name'])
        const parsedInfo = info.map(i => 
            {
                const parsedSubcategories = i.children.map(c => {
                    return {
                        id: c.id,
                        name: c.name[0]
                    }
                })
                return {
                    id: i.parent.id,
                    name: i.parent.name[0],
                    subcategories: parsedSubcategories
                }
            })
        context.res = {
            status: 200,
            body: parsedInfo
        };
    } catch (err) {
        console.log(err)
        context.res = {
            status: 500,
            body: "Error found: " + err
        };
    }
};
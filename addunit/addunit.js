const { uuid } = require('uuidv4');

const cosmos = require('../util/persistence')
const security = require('../util/security')

module.exports = async function (context, req) {
    context.log('POST /secure/units');
    
    const securityResult = await security.checkToken(context, req);

    if (!securityResult.success)
    {
        context.res = {
            status: securityResult.error.code,
            body: securityResult.error.message
        }
    } else if (!security.isAdmin(securityResult.user)) {
        context.res = {
            status: 401,
            body: "User cannot add units."
        }
    } else {
        const info = {
            name: req.body.name
        }
        const id = uuid()
        
        try {
            await cosmos.createEntryOfKind('unit', id, info, [])
            info.id = id
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
    }
};
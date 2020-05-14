const cosmos = require('../util/persistence')
const security = require('../util/security')

module.exports = async function (context, req) {
    context.log('DELETE /secure/recipes');
    
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
            body: "User cannot complete this operation."
        }
    } else {
        try {
            const id = req.body.id;
            await cosmos.deleteEntry(id, ['uses', 'derivative']);
            context.res = {
                status: 200,
                body: "Success"
            }
        } catch (err) {
            console.log(err)
            context.res = {
                status: 500,
                body: "Error found: " + err
            };
        }
    }
};
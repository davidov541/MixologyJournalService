const cosmos = require('../util/cosmos')
const security = require('../util/security')

module.exports = async function (context, req) {
    context.log('DELETE /secure/recipes');
    
    context.log("Request: " + JSON.stringify(req));
    const securityResult = security.checkToken(context, req);

    if (!securityResult.success)
    {
        context.res = {
            status: securityResult.error.code,
            body: securityResult.error.message
        }
    } else {
        try {
            const id = req.body.id;
            context.log("ID: " + id);
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
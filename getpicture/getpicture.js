const security = require('../util/security')
const adls = require('../util/adls')

module.exports = async function (context, req) {
    context.log('POST /secure/getpicture');

    const securityResult = await security.checkToken(context, req);
    if (!securityResult.success)
    {
        context.res = {
            status: securityResult.error.code,
            body: securityResult.error.message
        }
    } else {
        try {
            const fileSAS = adls.getSASForFile(req.body.filePath)
            context.res = {
                body: {
                    filePath: body.filePath,
                    fileSAS: fileSAS
                }
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
const security = require('../util/security')
const multipart = require('parse-multipart')
const adls = require('../util/adls')

module.exports = async function (context, req) {
    context.log('POST /secure/upload');

    const securityResult = await security.checkToken(context, req);
    if (!securityResult.success)
    {
        context.res = {
            status: securityResult.error.code,
            body: securityResult.error.message
        }
    } else {
        try {
            const bodyBuffer = req.body;
            const boundary = multipart.getBoundary(req.headers['content-type']);
            const parts = multipart.Parse(bodyBuffer, boundary);

            const directory = 'creation-pics/' + securityResult.user.payload.sub
            await adls.createDirectoryIfNotExists(directory)
            await adls.uploadFile(parts[0].data, directory + '/foo.png')
        } catch (err) {
            console.log(err)
            context.res = {
                status: 500,
                body: "Error found: " + err
            };
        }
    }
};
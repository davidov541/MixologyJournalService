const security = require('../util/security')
const multipart = require('parse-multipart')
const adls = require('../util/adls')
const { uuid } = require('uuidv4');

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
            const imageId = "/" + uuid() + ".png"
            await adls.createDirectoryIfNotExists(directory)
            await adls.uploadFile(parts[0].data, directory + imageId)
        } catch (err) {
            console.log(err)
            context.res = {
                status: 500,
                body: "Error found: " + err
            };
        }
    }
};
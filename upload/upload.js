const security = require('../util/security')
const multipart = require('parse-multipart')
const adls = require('../util/adls')

module.exports = async function (context, req) {
    context.log('GET /secure/upload');

    const securityResult = await security.checkToken(context, req);
    if (!securityResult.success)
    {
        context.res = {
            status: securityResult.error.code,
            body: securityResult.error.message
        }
    } else {
        try {
            context.log("Retrieved body: " + req.body)
            // encode body to base64 string
            const bodyBuffer = req.body;
            // get boundary for multipart data e.g. ------WebKitFormBoundaryDtbT5UpPj83kllfw
            const boundary = multipart.getBoundary(req.headers['content-type']);
            // parse the body
            const parts = multipart.Parse(bodyBuffer, boundary);
            await adls.uploadFile(parts[0].data, 'foo.png')
        } catch (err) {
            console.log(err)
            context.res = {
                status: 500,
                body: "Error found: " + err
            };
        }
    }
};
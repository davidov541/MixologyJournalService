const security = require('../util/security')
const multipart = require('parse-multipart')
const adls = require('../util/adls')
const { uuid } = require('uuidv4');

module.exports = async function (context, req) {
    context.log('POST /secure/addpicture');

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
            context.log("***Request***: " + JSON.stringify(req))
            const parsedType = req.headers['content-type'].replace("\\\"", "").replace("\"", "");
            context.log("***Parsed Type***:" + parsedType);
            const boundary = multipart.getBoundary(parsedType);
            context.log("***Boundary***: " + boundary);
            const parts = multipart.Parse(bodyBuffer, boundary);
            context.log("***Parts***: " + JSON.stringify(parts));

            const directory = 'creation-pics/' + securityResult.user.payload.sub
            const imageId = "/" + uuid() + ".png"
            await adls.createDirectoryIfNotExists(directory)
            await adls.uploadFile(parts[0].data, directory + imageId)
            const fileSAS = adls.getSASForFile(directory + imageId)
            context.res = {
                body: {
                    filePath: directory + imageId,
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
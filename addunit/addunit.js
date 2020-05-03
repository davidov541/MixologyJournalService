const { uuid } = require('uuidv4');

const cosmos = require('../util/cosmos')

module.exports = async function (context, req) {
    context.log('POST /secure/units');

    const secret = process.env.APP_SECRET;

    const info = {
        name: req.body.name
    }
    const id = uuid()
    
    try {
        if (!req.headers.hasOwnProperty('app-secret')) {
            context.res = {
                status: 401,
                body: "Must be authorized to use this API."
            }
        } else if (req.headers['app-secret'] != secret) {
            context.res = {
                status: 401,
                body: "Invalid credentials."
            }
        } else {
            await cosmos.createEntryOfKind('unit', id, info, [])
            info.id = id
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: info
            };
        }
    } catch (err) {
        console.log(err)
        context.res = {
            status: 500,
            body: "Error found: " + err
        };
    }
};
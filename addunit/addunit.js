const { uuid } = require('uuidv4');

const cosmos = require('../util/cosmos')

module.exports = async function (context, req) {
    context.log('POST /secure/units');

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
};
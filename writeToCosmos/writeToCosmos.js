const cosmos = require('../util/cosmos');

module.exports = async function(context, msg) {
    console.log("Message = " + JSON.stringify(msg));
    await cosmos.createEntryOfKind(msg.kind, msg.id, {}, []);
};
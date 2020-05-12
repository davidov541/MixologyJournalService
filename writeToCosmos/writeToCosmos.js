const cosmos = require('../util/cosmos');

module.exports = async function(context, msg) {
    await cosmos.createEntryOfKind(msg.kind, msg.id, msg.properties, msg.edges);
};
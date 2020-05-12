const cosmos = require('../util/cosmos');

module.exports = async function(context, msg) {
    switch(msg.entityType)
    {
        case 'vertex':
            await cosmos.createEntryOfKind(msg.kind, msg.id, msg.properties, msg.edges);
            break;
        case 'edge':
            await cosmos.createEdge(msg.source, msg.target, msg.relationship, msg.properties);
            break;
    }
};
var servicebus = require('./servicebus')
var cosmos = require('./cosmos')

async function getAllDescendentsOfKind(kind) {
    return await cosmos.getAllDescendentsOfKind(kind);
}

async function getAllDescendentsOfEntity(id) {
    return await cosmos.getAllDescendentsOfEntity(id);
}

async function getEntriesOfKind(kind, properties) {
    return await cosmos.getEntriesOfKind(kind, properties);
}

async function getPropertiesOfEntity(id, properties) {
    return await cosmos.getPropertiesOfEntity(id, properties);
}

async function getConnectedEntriesOfKind(id, label, vertexProperties, edgeProperties = []) {
    return await cosmos.getConnectedEntriesOfKind(id, label, vertexProperties, edgeProperties)
}

async function createEntryOfKind(kind, id, properties, edges) {
    const vertex = {
        command: "add-vertex",
        kind: kind,
        id: id,
        properties: properties,
        edges: edges
    }

    await servicebus.sendCreationMessage(vertex);
}

async function createEdge(source, target, relationship, properties) {
    const edge = {
        command: "add-edge",
        source: source,
        target: target,
        properties: properties,
        relationship: relationship
    }
    
    await servicebus.sendCreationMessage(edge);
}

async function deleteEntry(id, edgeLabelsToFollow) {
    const deletionInfo = {
        command: "delete-vertex",
        id: id,
        edgeLabelsToFollow: edgeLabelsToFollow
    }
    
    await servicebus.sendCreationMessage(deletionInfo);
}

async function deleteEdge(id) {
    const deletionInfo = {
        command: "delete-edge",
        id: id
    }
    
    await servicebus.sendCreationMessage(deletionInfo);
}

exports.getAllDescendentsOfKind = getAllDescendentsOfKind;
exports.getAllDescendentsOfEntity = getAllDescendentsOfEntity;
exports.getEntriesOfKind = getEntriesOfKind;
exports.getPropertiesOfEntity = getPropertiesOfEntity;
exports.createEntryOfKind = createEntryOfKind;
exports.getConnectedEntriesOfKind = getConnectedEntriesOfKind;
exports.createEdge = createEdge;
exports.deleteEntry = deleteEntry;
exports.deleteEdge = deleteEdge;
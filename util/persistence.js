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

async function getAllIncomingEdgesOfKind(id, label, properties) {
    return await cosmos.getAllIncomingEdgesOfKind(id, label, properties)
}

async function getEntriesAndRelated(kind, edgeLabel, parentProperties, childProperties) {
    return await cosmos.getEntriesAndRelated(kind, edgeLabel, parentProperties, childProperties)
}

function queueCreateEntry(kind, id, properties, edges) {
    return {
        command: "add-vertex",
        kind: kind,
        id: id,
        properties: properties,
        edges: edges
    }
}

async function createEntryOfKind(kind, id, properties, edges) {
    const vertex = queueCreateEntry(kind, id, properties, edges);

    await servicebus.sendMutation(vertex);
}

function queueCreateEdge(source, target, relationship, properties) {
    return {
        command: "add-edge",
        source: source,
        target: target,
        properties: properties,
        relationship: relationship
    }
}

async function createEdge(source, target, relationship, properties) {
    const edge = queueCreateEdge(source, target, relationship, properties)
    
    await servicebus.sendMutation(edge);
}

function queueDeleteEntry(id, edgeLabelsToFollow) {
    return {
        command: "delete-vertex",
        id: id,
        edgeLabelsToFollow: edgeLabelsToFollow
    }
}

async function deleteEntry(id, edgeLabelsToFollow) {
    const deletionInfo = queueDeleteEntry(id, edgeLabelsToFollow)
    
    await servicebus.sendMutation(deletionInfo);
}

function queueDeleteEdge(id) {
    return {
        command: "delete-edge",
        id: id
    }
}

async function deleteEdge(id) {
    const deletionInfo = queueDeleteEdge(id)
    
    await servicebus.sendMutation(deletionInfo);
}

async function submitMutations(mutations) {
    await servicebus.sendMutations(mutations);
}

exports.getAllDescendentsOfKind = getAllDescendentsOfKind;
exports.getAllDescendentsOfEntity = getAllDescendentsOfEntity;
exports.getEntriesOfKind = getEntriesOfKind;
exports.getPropertiesOfEntity = getPropertiesOfEntity;
exports.getConnectedEntriesOfKind = getConnectedEntriesOfKind;
exports.getAllIncomingEdgesOfKind = getAllIncomingEdgesOfKind;
exports.getEntriesAndRelated = getEntriesAndRelated;

exports.queueCreateEntry = queueCreateEntry;
exports.queueCreateEdge = queueCreateEdge;
exports.queueDeleteEntry = queueDeleteEntry;
exports.queueDeleteEdge = queueDeleteEdge;

exports.createEntryOfKind = createEntryOfKind;
exports.createEdge = createEdge;
exports.deleteEntry = deleteEntry;
exports.deleteEdge = deleteEdge;

exports.submitMutations = submitMutations;
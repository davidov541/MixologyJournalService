const Gremlin = require('gremlin');
const config = require("../config/config");
const servicebus = require('./servicebus')

const authenticator = new Gremlin.driver.auth.PlainTextSaslAuthenticator(`/dbs/${config.database}/colls/${config.collection}`, config.primaryKey)

function createClient() {
    return new Gremlin.driver.Client(
        config.endpoint,
        {
            authenticator,
            traversalsource: "g",
            rejectUnauthorized: true,
            mimeType: "application/vnd.gremlin-v2.0+json"
        }
    );
}

async function getAllDescendentsOfKind(kind) {
    const command = "g.V().hasLabel(label).outE().inV().outE().inV().tree()";
    const client = createClient();
    await client.open();
    const result = await client.submit(command, {
        label: kind
    });
    console.log("getAllDescendentsOfKind; kind = " + kind + ";RUs used: " + result.attributes["x-ms-request-charge"])
    await client.close();
    return result._items[0];
}

async function getAllDescendentsOfEntity(id) {
    const command = "g.V(id).outE().inV().outE().inV().tree()";
    const client = createClient();
    await client.open();
    const result = await client.submit(command, {
        id: id
    });
    console.log("getAllDescendentsOfEntity; id = " + id + ";RUs used: " + result.attributes["x-ms-request-charge"])
    await client.close();
    return result._items[0][id];
}

async function getEntriesOfKind(kind, properties) {
    const command = "g.V().hasLabel(label)"
    const client = createClient()
    await client.open();
    const result = await client.submit(command, {
        label: kind
    })
    console.log("GetEntriesOfKind; kind = " + kind + ";properties = " + JSON.stringify(properties) + ";RUs used: " + result.attributes["x-ms-request-charge"])
    await client.close();
    return result._items.map(i => {
        var result = {
            id: i.id
        }
        properties.forEach(p => result[p] = i.properties[p][0].value)
        return result;
    })
}

async function getConnectedEntriesOfKind(id, label, vertexProperties, edgeProperties = []) {
    const command = "g.V(id).outE().inV().hasLabel(label).path()"
    const client = createClient()
    await client.open();
    const result = await client.submit(command, {
        id: id,
        label: label
    })
    console.log("getConnectedEntriesOfKind; id = " + id + 
    ";label = " + label + 
    ";vertexProperties = " + JSON.stringify(vertexProperties) + 
    ";edgeProperties = " + JSON.stringify(edgeProperties) + 
    ";RUs used: " + result.attributes["x-ms-request-charge"])
    await client.close();
    return result._items.map(i => {
        const edge = i.objects[1]
        const vertex = i.objects[2]
        var result = {
            id: vertex.id
        }
        result.vertex = {}
        result.edge = {}
        vertexProperties.forEach(p => result.vertex[p] = vertex.properties[p][0].value)
        edgeProperties.forEach(p => result.edge[p] = edge.properties[p])
        return result;
    })
}

async function createEntryOfKind(kind, id, properties, edges) {
    const vertex = {
        entityType: "vertex",
        kind: kind,
        id: id,
        properties: properties,
        edges: edges
    }

    await servicebus.sendCreationMessage(vertex);
}

async function createEdge(source, target, relationship, properties) {
    const edge = {
        entityType: "edge",
        source: source,
        target: target,
        properties: properties,
        relationship: relationship
    }
    
    await servicebus.sendCreationMessage(edge);
}

async function deleteEntry(id, edgeLabelsToFollow) {
    const edgeLabels = edgeLabelsToFollow.map(label => "'" + label + "'").join(',');
    const command1 = "g.V(id).outE().hasLabel(labels).inV().drop()";

    const client = createClient()
    await client.open();
    const result1 = await client.submit(command1, {
        id: id,
        labels: edgeLabels
    })
    console.log("deleteEntry #1; id = " + id +
    ";edgeLabelsToFollow = " + JSON.stringify(edgeLabelsToFollow) +
    ";RUs used: " + result1.attributes["x-ms-request-charge"])

    var command2 = "g.V(id).drop()"
    const result2 = await client.submit(command2, {
        id: id
    })
    console.log("deleteEntry #2; id = " + id +
    ";edgeLabelsToFollow = " + JSON.stringify(edgeLabelsToFollow) +
    ";RUs used: " + result2.attributes["x-ms-request-charge"])

    await client.close();
}

exports.getAllDescendentsOfKind = getAllDescendentsOfKind;
exports.getAllDescendentsOfEntity = getAllDescendentsOfEntity;
exports.getEntriesOfKind = getEntriesOfKind;
exports.createEntryOfKind = createEntryOfKind;
exports.getConnectedEntriesOfKind = getConnectedEntriesOfKind;
exports.createEdge = createEdge;
exports.deleteEntry = deleteEntry;
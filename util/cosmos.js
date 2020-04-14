const Gremlin = require('gremlin');
const config = require("../config/config");

const authenticator = new Gremlin.driver.auth.PlainTextSaslAuthenticator(`/dbs/${config.database}/colls/${config.collection}`, config.primaryKey)

const client = new Gremlin.driver.Client(
    config.endpoint,
    {
        authenticator,
        traversalsource: "g",
        rejectUnauthorized: true,
        mimeType: "application/vnd.gremlin-v2.0+json"
    }
);

async function getEntriesOfKind(kind, properties) {
    const command = "g.V().hasLabel(label)"
    await client.open();
    const result = await client.submit(command, {
        label: kind
    })
    console.log("Result: %s\n", JSON.stringify(result));
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
    await client.open();
    const result = await client.submit(command, {
        id: id,
        label: label
    })
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
    var command = "g.addV(label).property('id', id).property('partition_key', partition_key)"
    Object.keys(properties).forEach(k => command += `.property('${k}', '${properties[k]}')`)
    await client.open();
    const result = await client.submit(command, {
        label: kind,
        id: id,
        partition_key: id
    })
    console.log("Result Vertex: %s\n", JSON.stringify(result));

    const edgePromises = edges.map(async e => createEdge(id, e.id, e.relationship, e.properties))
    await Promise.all(edgePromises)

    await client.close();
}

async function createEdge(source, target, relationship, properties) {
    var command = "g.V(source).addE(relationship).to(g.V(target))";
    Object.keys(properties).forEach(k => command += `.property('${k}', '${properties[k]}')`)
    await client.submit(command, {
        source: source,
        relationship: relationship,
        target: target
    })
}

exports.getEntriesOfKind = getEntriesOfKind;
exports.createEntryOfKind = createEntryOfKind;
exports.getConnectedEntriesOfKind = getConnectedEntriesOfKind;
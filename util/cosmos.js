const Gremlin = require('gremlin');
const config = require("../config/config");

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
    var command = "g.addV(label).property('id', id).property('partition_key', partition_key)"
    Object.keys(properties).forEach(k => command += `.property('${k}', '${properties[k]}')`)
    const client = createClient()
    await client.open();
    const result = await client.submit(command, {
        label: kind,
        id: id,
        partition_key: id
    })
    console.log("createEntryOfKind; kind = " + kind + 
    ";id = " + id + 
    ";properties = " + JSON.stringify(properties) + 
    ";edges = " + JSON.stringify(edges) + 
    "RUs used: " + result.attributes["x-ms-request-charge"])

    const edgePromises = edges.map(async e => await createEdge(id, e.id, e.relationship, e.properties))
    await Promise.all(edgePromises)

    await client.close();
}

async function createEdge(source, target, relationship, properties) {
    var command = "g.V(source).addE(relationship).to(g.V(target))";
    Object.keys(properties).forEach(k => command += `.property('${k}', '${properties[k]}')`)
    const client = createClient()
    const result = await client.submit(command, {
        source: source,
        relationship: relationship,
        target: target
    })
    console.log("createEdge; source = " + source + 
    ";target = " + target + 
    ";relationship = " + relationship + 
    ";properties = " + JSON.stringify(properties) + 
    "RUs used: " + result.attributes["x-ms-request-charge"])
    client.close();
}

exports.getAllDescendentsOfKind = getAllDescendentsOfKind;
exports.getAllDescendentsOfEntity = getAllDescendentsOfEntity;
exports.getEntriesOfKind = getEntriesOfKind;
exports.createEntryOfKind = createEntryOfKind;
exports.getConnectedEntriesOfKind = getConnectedEntriesOfKind;
exports.createEdge = createEdge;
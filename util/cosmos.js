var gremlin = require('gremlin');

var GetAuthenticator = () => new gremlin.driver.auth.PlainTextSaslAuthenticator(`/dbs/${process.env.COSMOS_DATABASE}/colls/${process.env.COSMOS_COLLECTION}`, process.env.COSMOS_PUBLICKEY)

function createClient() {
    const authenticator = GetAuthenticator()
    return new gremlin.driver.Client(
        process.env.COSMOS_ENDPOINT,
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

async function getPropertiesOfEntity(id, properties) {
    const command = "g.V(id)";
    const client = createClient();
    await client.open();
    const result = await client.submit(command, {
        id: id
    });
    console.log("getPropertiesOfEntity; id = " + id + 
        "properties = " + JSON.stringify(properties) + 
        ";RUs used: " + result.attributes["x-ms-request-charge"])
    await client.close();
    const foundItem = result._items.length > 0
    var finalResult = {
        success: foundItem,
        id: id,
        properties: {}
    }
    if (foundItem)
    {
        const foundVertex = result._items[0]
        properties.forEach(p => finalResult.properties[p] = foundVertex.properties[p][0].value)
    }
    return finalResult;
}

async function getEntriesOfKind(kind, properties) {
    const propertyList = properties.map(p => "\"" + p + "\"").join(',')
    const command = "g.V().hasLabel(label).valuemap(true, " + propertyList + ")"
    const client = createClient()
    await client.open();
    const result = await client.submit(command, {
        label: kind
    })
    console.log("GetEntriesOfKind; kind = " + kind + ";properties = " + JSON.stringify(properties) + ";RUs used: " + result.attributes["x-ms-request-charge"])
    await client.close();
    console.log("Raw data from Cosmos: " + JSON.stringify(result._items));
    return result._items.map(i => {
        var result = {
            id: i.id
        }
        properties.forEach(p => {
            console.log("Property being parsed: " + JSON.stringify(p))
            if (p in i)
            {
                console.log("Found property " + p + " in " + JSON.stringify(i))
                result[p] = i[p][0];
            }
        })
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

async function getAllIncomingEdgesOfKind(id, kind, properties) {
    const command = "g.V(id).inE().hasLabel(label)"
    const client = createClient()
    await client.open();
    const result = await client.submit(command, {
        id: id,
        label: kind
    })
    console.log("getAllIncomingEdgesOfKind; kind = " + kind + ";properties = " + JSON.stringify(properties) + ";RUs used: " + result.attributes["x-ms-request-charge"])
    await client.close();
    return result._items.map(i => {
        var result = {
            id: i.id
        }
        properties.forEach(p => result[p] = i.properties[p])
        return result;
    })
}

exports.getAllDescendentsOfKind = getAllDescendentsOfKind;
exports.getAllDescendentsOfEntity = getAllDescendentsOfEntity;
exports.getPropertiesOfEntity = getPropertiesOfEntity;
exports.getEntriesOfKind = getEntriesOfKind;
exports.getConnectedEntriesOfKind = getConnectedEntriesOfKind;
exports.getAllIncomingEdgesOfKind = getAllIncomingEdgesOfKind;
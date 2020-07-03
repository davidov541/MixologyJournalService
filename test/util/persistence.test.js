const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../../util/persistence');

function setupMockCosmos() {
    return sinon.mock(uut.__get__("cosmos"))
}

function setupMockServiceBus() {
    return sinon.mock(uut.__get__("servicebus"))
}

describe('Persistence Facade Tests', function () {
    test('should properly return all descendants of a given kind', async function () {
        const mockCosmos = setupMockCosmos();

        const testKind = "Test Kind";
        const expectedReturnValue = "Test Result"

        mockCosmos
            .expects("getAllDescendentsOfKind")
            .once()
            .withArgs(testKind)
            .returns(expectedReturnValue)

        const actual = await uut.getAllDescendentsOfKind(testKind)

        expect(actual).toEqual(expectedReturnValue)

        mockCosmos.verify()

        mockCosmos.restore()
    })

    test('should properly return all descendants of a specific entity', async function () {
        const mockCosmos = setupMockCosmos();

        const testEntity = "Test Entity";
        const expectedReturnValue = "Test Result"

        mockCosmos
            .expects("getAllDescendentsOfEntity")
            .once()
            .withArgs(testEntity)
            .returns(expectedReturnValue)

        const actual = await uut.getAllDescendentsOfEntity(testEntity)

        expect(actual).toEqual(expectedReturnValue)

        mockCosmos.verify()

        mockCosmos.restore()
    })

    test('should properly properties of a specific vertex', async function () {
        const mockCosmos = setupMockCosmos();

        const testId = "Test Id";
        const testProperties = ["Test Property 1"];
        const expectedReturnValue = "Test Result"

        mockCosmos
            .expects("getPropertiesOfEntity")
            .once()
            .withArgs(testId, testProperties)
            .returns(expectedReturnValue)

        const actual = await uut.getPropertiesOfEntity(testId, testProperties)

        expect(actual).toEqual(expectedReturnValue)

        mockCosmos.verify()

        mockCosmos.restore()
    })

    test('should properly return all entities of a kind', async function () {
        const mockCosmos = setupMockCosmos();

        const testKind = "Test Kind";
        const testProperties = "Test Properties";
        const expectedReturnValue = "Test Result"

        mockCosmos
            .expects("getEntriesOfKind")
            .once()
            .withArgs(testKind, testProperties)
            .returns(expectedReturnValue)

        const actual = await uut.getEntriesOfKind(testKind, testProperties)

        expect(actual).toEqual(expectedReturnValue)

        mockCosmos.verify()

        mockCosmos.restore()
    })

    test('should properly return all connected entities of a kind', async function () {
        const mockCosmos = setupMockCosmos();

        const testId = "Test Id";
        const testLabel = "Test Label";
        const testVertexProperties = "Test Vertex Properties";
        const testEdgeProperties = "Test Edge Properties";
        const expectedReturnValue = "Test Result";

        mockCosmos
            .expects("getConnectedEntriesOfKind")
            .once()
            .withArgs(testId, testLabel, testVertexProperties, testEdgeProperties)
            .returns(expectedReturnValue)

        const actual = await uut.getConnectedEntriesOfKind(testId, testLabel, testVertexProperties, testEdgeProperties)

        expect(actual).toEqual(expectedReturnValue)

        mockCosmos.verify()

        mockCosmos.restore()
    })

    test('should properly create an entry', async function () {
        const mockCosmos = setupMockServiceBus();

        const testKind = "Test Kind";
        const testId = "Test Id";
        const testProperties = "Test Properties";
        const testEdges = "Test Edges";

        const expectedVertexInfo = {
            entityType: "vertex",
            kind: testKind,
            id: testId,
            properties: testProperties,
            edges: testEdges
        }

        mockCosmos
            .expects("sendCreationMessage")
            .once()
            .withArgs(expectedVertexInfo)

        await uut.createEntryOfKind(testKind, testId, testProperties, testEdges)

        mockCosmos.verify()

        mockCosmos.restore()
    })

    test('should properly create an edge', async function () {
        const mockCosmos = setupMockServiceBus();

        const testSource = "Test Source";
        const testTarget = "Test Target";
        const testRelationship = "Test Relationship";
        const testProperties = "Test Properties";

        const expectedVertexInfo = {
            entityType: "edge",
            source: testSource,
            target: testTarget,
            properties: testProperties,
            relationship: testRelationship
        }

        mockCosmos
            .expects("sendCreationMessage")
            .once()
            .withArgs(expectedVertexInfo)

        await uut.createEdge(testSource, testTarget, testRelationship, testProperties)

        mockCosmos.verify()

        mockCosmos.restore()
    })

    test('should properly delete an entry', async function () {
        const mockCosmos = setupMockServiceBus();

        const testId = "Test ID";
        const testEdgeLabelsToFollow = "Test Edge Labels to Follow";

        const expectedVertexInfo = {
            entityType: "deletion",
            id: testId,
            edgeLabelsToFollow: testEdgeLabelsToFollow
        }

        mockCosmos
            .expects("sendCreationMessage")
            .once()
            .withArgs(expectedVertexInfo)

        await uut.deleteEntry(testId, testEdgeLabelsToFollow)

        mockCosmos.verify()

        mockCosmos.restore()
    })
})
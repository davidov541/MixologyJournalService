const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../../util/cosmos');

uut.__set__("GetAuthenticator", () => {})

function setupMockGremlin(submitFake) {
    const clientStub = sinon.stub();

    const openSpy = sinon.spy();
    const closeSpy = sinon.spy();

    const clientInstanceMock = {
        open: openSpy,
        submit: submitFake,
        close: closeSpy
    }

    clientStub.returns(clientInstanceMock);

    const gremlinMock = {
        driver: {
            Client: clientStub
        },
    };

    uut.__set__("gremlin", gremlinMock);

    return {"openSpy": openSpy, "closeSpy": closeSpy}
}

function checkOpenAndCloseOfGremlin(spies) {
    expect(spies.openSpy.called).toBeTruthy();
    expect(spies.openSpy.callCount).toBe(1);
    
    expect(spies.closeSpy.called).toBeTruthy();
    expect(spies.closeSpy.callCount).toBe(1);
}

describe('Cosmos Interface Tests', function () {
    test('should properly return all descendants of a given kind', async function () {
        const returnValue = {
            "_items": [
                {
                    "message": "Some Result"
                }
            ],
            attributes: {
                "x-ms-request-charge": 10
            }
        }
        const gremlinSubmitFake = sinon.fake.returns(returnValue)
        const spies = setupMockGremlin(gremlinSubmitFake);

        const testKind = "testKind";

        const actual = await uut.getAllDescendentsOfKind(testKind)

        expect(actual).toEqual(returnValue._items[0])
        
        checkOpenAndCloseOfGremlin(spies)

        expect(gremlinSubmitFake.called).toBeTruthy();
        expect(gremlinSubmitFake.callCount).toBe(1);

        const args = gremlinSubmitFake.args[0]
        expect(args[0]).toEqual("g.V().hasLabel(label).outE().inV().outE().inV().tree()")
        expect(args[1]).toEqual({label: testKind})
    })
    
    test('should properly return all descendants of a given entity', async function () {
        const returnValue = {
            "_items": [
                {
                    "testID": {
                        "message": "Some Result"
                    }
                }
            ],
            attributes: {
                "x-ms-request-charge": 10
            }
        }
        const gremlinSubmitFake = sinon.fake.returns(returnValue)
        const spies = setupMockGremlin(gremlinSubmitFake);

        const testID = "testID";

        const actual = await uut.getAllDescendentsOfEntity(testID)

        expect(actual).toEqual(returnValue._items[0].testID)

        checkOpenAndCloseOfGremlin(spies);
        
        expect(gremlinSubmitFake.called).toBeTruthy();
        expect(gremlinSubmitFake.callCount).toBe(1);
        
        const args = gremlinSubmitFake.args[0]
        expect(args[0]).toEqual("g.V(id).outE().inV().outE().inV().tree()")
        expect(args[1]).toEqual({id: testID})
    })

    test('should properly return all entities of a given kind', async function () {
        const returnValue = {
            "_items": [
                {
                    "id": "Result1",
                    "properties": {
                        "requestedProp": [
                            {
                                "value": "requestedPropValue1"
                            }
                        ],
                        "otherProp": [
                            {
                                "value": "otherPropValue1"
                            }
                        ]
                    }
                },
                {
                    "id": "Result2",
                    "properties": {
                        "requestedProp": [
                            {
                                "value": "requestedPropValue2"
                            }
                        ]
                    }
                }
            ],
            attributes: {
                "x-ms-request-charge": 10
            }
        }
        const gremlinSubmitFake = sinon.fake.returns(returnValue)
        const spies = setupMockGremlin(gremlinSubmitFake);

        const testKind = "testKind";

        const actual = await uut.getEntriesOfKind(testKind, ["requestedProp"])
        const expected = [
            {
                "id": "Result1",
                "requestedProp": "requestedPropValue1"
            },
            {
                "id": "Result2",
                "requestedProp": "requestedPropValue2"
            }
        ]

        expect(actual).toEqual(expected)
        
        checkOpenAndCloseOfGremlin(spies)

        expect(gremlinSubmitFake.called).toBeTruthy();
        expect(gremlinSubmitFake.callCount).toBe(1);

        const args = gremlinSubmitFake.args[0]
        expect(args[0]).toEqual("g.V().hasLabel(label)")
        expect(args[1]).toEqual({label: testKind})
    })

    test('should properly return all connected entities of a given kind', async function () {
        const returnValue = {
            "_items": [
                {
                    "objects": [
                        {},
                        {
                            "properties": {
                                "requestedEdgeProp": "requestedEdgePropValue1",
                                "ignoredEdgeProp": "ignoredEdgePropValue1"
                            }
                        },
                        {
                            "id": "vertexID1",
                            "properties": {
                                "requestedVertexProp": [
                                    {
                                        "value": "requestedVertexPropValue1"
                                    }
                                ],
                                "ignoredVertexProp": [
                                    {
                                        "value": "ignoredVertexPropValue1"
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    "objects": [
                        {},
                        {
                            "properties": {
                                "requestedEdgeProp": "requestedEdgePropValue2",
                                "ignoredEdgeProp": "ignoredEdgePropValue2"
                            }
                        },
                        {
                            "id": "vertexID2",
                            "properties": {
                                "requestedVertexProp": [
                                    {
                                        "value": "requestedVertexPropValue2"
                                    }
                                ],
                                "ignoredVertexProp": [
                                    {
                                        "value": "ignoredVertexPropValue2"
                                    }
                                ]
                            }
                        }
                    ]
                }
            ],
            attributes: {
                "x-ms-request-charge": 10
            }
        }
        const gremlinSubmitFake = sinon.fake.returns(returnValue)
        const spies = setupMockGremlin(gremlinSubmitFake);

        const testKind = "testKind";
        const testID = "testID"
        const vertexProperties = ["requestedVertexProp"]
        const edgeProperties = ["requestedEdgeProp"]

        const actual = await uut.getConnectedEntriesOfKind(testID, testKind, vertexProperties, edgeProperties)
        const expected = [
            {
                "id": "vertexID1",
                "vertex": {
                    "requestedVertexProp": "requestedVertexPropValue1"
                },
                "edge": {
                    "requestedEdgeProp": "requestedEdgePropValue1"
                }
            },
            {
                "id": "vertexID2",
                "vertex": {
                    "requestedVertexProp": "requestedVertexPropValue2"
                },
                "edge": {
                    "requestedEdgeProp": "requestedEdgePropValue2"
                }
            },
        ]

        expect(actual).toEqual(expected)
        
        checkOpenAndCloseOfGremlin(spies)

        expect(gremlinSubmitFake.called).toBeTruthy();
        expect(gremlinSubmitFake.callCount).toBe(1);

        const args = gremlinSubmitFake.args[0]
        expect(args[0]).toEqual("g.V(id).outE().inV().hasLabel(label).path()")
        expect(args[1]).toEqual({label: testKind, id: testID})
    })
})
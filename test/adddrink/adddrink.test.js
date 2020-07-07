const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../../adddrink/adddrink')

function setupMockSecurity() {
    return sinon.mock(uut.__get__("security"))
}

function setupMockPersistence() {
    return sinon.mock(uut.__get__("cosmos"))
}

describe('Add Drink Function Tests', function () {
    test('should return an error if the authentication fails.', async function () {
        const mockSecurity = setupMockSecurity()
        
        const mockResult = {
            "success": false,
            "error": {
                "code": "Test Code",
                "message": "Test Message"
            }
        }

        var context = {   
            res: {},
            log: function (msg) {}        
        }

        const request = {}

        mockSecurity
            .expects("checkToken")
            .once()
            .withArgs(context, request)
            .returns(mockResult)

        await uut(context, request);

        const expectedResponse = {
            "status": mockResult.error.code,
            "body": mockResult.error.message
        }
        expect(context.res).toEqual(expectedResponse);

        mockSecurity.verify()

        mockSecurity.restore()
    });

    test('should correctly add the drink if authentication succeeds, along with user for a new user.', async function () {
        const mockSecurity = setupMockSecurity()
        const mockPersistence = setupMockPersistence()
        
        const mockSecurityResult = {
            "success": true,
            "error": {
                "code": "Test Code",
                "message": "Test Message"
            },
            "user": {
                "payload": {
                    "sub": "User",
                    "name": "Some User"
                }
            }
        }

        var context = {   
            res: {},
            log: function (msg) {}        
        }

        const request = {
            "body": {
                "name": "Test Recipe",
                "ingredients": [
                    {
                        "ingredient": {
                            "id": "Ingredient-1"
                        },
                        "unit": {
                            "id": "Unit-1"
                        },
                        "amount": "1.0"
                    },
                    {
                        "ingredient": {
                            "id": "Ingredient-2"
                        },
                        "unit": {
                            "id": "Unit-2"
                        },
                        "amount": "2.0"
                    }
                ],
                "steps": [
                    "Step 1",
                    "Step 2",
                    "Step 3"
                ],
                "basisRecipe": "Recipe-1",
                "review": "Test Review",
                "rating": "1.0"
            }
        }

        const expectations = [
            mockSecurity
                .expects("checkToken")
                .once()
                .withArgs(context, request)
                .returns(mockSecurityResult),
            mockPersistence
                .expects("getPropertiesOfEntity")
                .once()
                .withArgs(mockSecurityResult.user.payload.sub, [])
                .returns({success: false}),
            mockPersistence
                .expects("createEntryOfKind")
                .once()
                .withExactArgs('user', mockSecurityResult.user.payload.sub, {
                    name: mockSecurityResult.user.payload.name
                }, []),
            mockPersistence.expects("createEntryOfKind")
                .once()
                .withExactArgs('ingredientUsage', sinon.match.any, {
                    "name": "Test Recipe Instance Ingredient Usage #1"
                }, [
                    {
                        "id": "Ingredient-1",
                        "relationship": "of",
                        "properties": {}
                    },
                    {
                        "id": "Unit-1",
                        "relationship": "amount",
                        "properties": {
                            "unitAmount": "1.0"
                        }
                    }
                ]),
            mockPersistence.expects("createEntryOfKind")
                .once()
                .withExactArgs('ingredientUsage', sinon.match.any, {
                    "name": "Test Recipe Instance Ingredient Usage #2"
                }, [
                    {
                        "id": "Ingredient-2",
                        "relationship": "of",
                        "properties": {}
                    },
                    {
                        "id": "Unit-2",
                        "relationship": "amount",
                        "properties": {
                            "unitAmount": "2.0"
                        }
                    }
                ]),
            mockPersistence.expects("createEntryOfKind")
                .once()
                .withExactArgs('drink', sinon.match.any, {
                    "name": "Test Recipe",
                    "steps": "%5B%22Step%201%22%2C%22Step%202%22%2C%22Step%203%22%5D"
                }, [
                    {
                        "id": sinon.match.any,
                        "relationship": "uses",
                        "properties": {}
                    },
                    {
                        "id": sinon.match.any,
                        "relationship": "uses",
                        "properties": {}
                    }
                ]),
            mockPersistence.expects("createEntryOfKind")
                .once()
                .withExactArgs('review', sinon.match.any, {
                    "name": "Test Recipe",
                    "rating": "1.0",
                    "review": "Test%20Review"
                }, [
                    {
                        "id": sinon.match.any,
                        "relationship": "reviews",
                        "properties": {}
                    }
                ]),
            mockPersistence.expects("createEdge")
                .once()
                .withExactArgs(sinon.match.any, sinon.match.any, 'review of', {}),
            mockPersistence.expects("createEdge")
                .once()
                .withExactArgs(sinon.match.any, sinon.match.any, 'derived from', {}),
            mockPersistence.expects("createEdge")
                .once()
                .withExactArgs(sinon.match.any, sinon.match.any, 'derivative', {}),
            mockPersistence.expects("createEdge")
                .once()
                .withExactArgs(sinon.match.any, "User", 'created by', {}),
            mockPersistence.expects("createEdge")
                .once()
                .withExactArgs("User", sinon.match.any, 'created', {})
        ]
            
        await uut(context, request);

        expect(context.res.body.message).toEqual("Success");

        expectations.map(e => e.verify())

        mockSecurity.restore()
        mockPersistence.restore()
    });

    test('should correctly add the drink if authentication succeeds.', async function () {
        const mockSecurity = setupMockSecurity()
        const mockPersistence = setupMockPersistence()
        
        const mockSecurityResult = {
            "success": true,
            "error": {
                "code": "Test Code",
                "message": "Test Message"
            },
            "user": {
                "payload": {
                    "sub": "User",
                    "name": "Some User"
                }
            }
        }

        var context = {   
            res: {},
            log: function (msg) {}        
        }

        const request = {
            "body": {
                "name": "Test Recipe",
                "ingredients": [
                    {
                        "ingredient": {
                            "id": "Ingredient-1"
                        },
                        "unit": {
                            "id": "Unit-1"
                        },
                        "amount": "1.0"
                    },
                    {
                        "ingredient": {
                            "id": "Ingredient-2"
                        },
                        "unit": {
                            "id": "Unit-2"
                        },
                        "amount": "2.0"
                    }
                ],
                "steps": [
                    "Step 1",
                    "Step 2",
                    "Step 3"
                ],
                "basisRecipe": "Recipe-1",
                "review": "Test Review",
                "rating": "1.0"
            }
        }

        const expectations = [
            mockSecurity
                .expects("checkToken")
                .once()
                .withArgs(context, request)
                .returns(mockSecurityResult),
            mockPersistence
                .expects("getPropertiesOfEntity")
                .once()
                .withArgs(mockSecurityResult.user.payload.sub, [])
                .returns({success: true}),
            mockPersistence.expects("createEntryOfKind")
                .once()
                .withExactArgs('ingredientUsage', sinon.match.any, {
                    "name": "Test Recipe Instance Ingredient Usage #1"
                }, [
                    {
                        "id": "Ingredient-1",
                        "relationship": "of",
                        "properties": {}
                    },
                    {
                        "id": "Unit-1",
                        "relationship": "amount",
                        "properties": {
                            "unitAmount": "1.0"
                        }
                    }
                ]),
            mockPersistence.expects("createEntryOfKind")
                .once()
                .withExactArgs('ingredientUsage', sinon.match.any, {
                    "name": "Test Recipe Instance Ingredient Usage #2"
                }, [
                    {
                        "id": "Ingredient-2",
                        "relationship": "of",
                        "properties": {}
                    },
                    {
                        "id": "Unit-2",
                        "relationship": "amount",
                        "properties": {
                            "unitAmount": "2.0"
                        }
                    }
                ]),
            mockPersistence.expects("createEntryOfKind")
                .once()
                .withExactArgs('drink', sinon.match.any, {
                    "name": "Test Recipe",
                    "steps": "%5B%22Step%201%22%2C%22Step%202%22%2C%22Step%203%22%5D"
                }, [
                    {
                        "id": sinon.match.any,
                        "relationship": "uses",
                        "properties": {}
                    },
                    {
                        "id": sinon.match.any,
                        "relationship": "uses",
                        "properties": {}
                    }
                ]),
            mockPersistence.expects("createEntryOfKind")
                .once()
                .withExactArgs('review', sinon.match.any, {
                    "name": "Test Recipe",
                    "rating": "1.0",
                    "review": "Test%20Review"
                }, [
                    {
                        "id": sinon.match.any,
                        "relationship": "reviews",
                        "properties": {}
                    }
                ]),
            mockPersistence.expects("createEdge")
                .once()
                .withExactArgs(sinon.match.any, sinon.match.any, 'review of', {}),
            mockPersistence.expects("createEdge")
                .once()
                .withExactArgs(sinon.match.any, sinon.match.any, 'derived from', {}),
            mockPersistence.expects("createEdge")
                .once()
                .withExactArgs(sinon.match.any, sinon.match.any, 'derivative', {}),
            mockPersistence.expects("createEdge")
                .once()
                .withExactArgs(sinon.match.any, "User", 'created by', {}),
            mockPersistence.expects("createEdge")
                .once()
                .withExactArgs("User", sinon.match.any, 'created', {})
        ]
            
        await uut(context, request);

        expect(context.res.body.message).toEqual("Success");

        expectations.map(e => e.verify())

        mockSecurity.restore()
        mockPersistence.restore()
    });
});
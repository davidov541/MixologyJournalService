const rewire = require('rewire');
const sinon = require('sinon');

const testUtil = require('../util/testutil')

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

        var context = testUtil.getBaseContext()

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

        var context = testUtil.getBaseContext()

        const request = testUtil.getBaseRequest({
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
        })

        const userMock = {type: "User"}
        const ingredientUsage1Mock = {type: "IngredientUsage1"}
        const ingredientUsage2Mock = {type: "IngredientUsage2"}
        const drinkMock = {type: "Drink"}
        const reviewMock = {type: "Review"}
        const reviewOfMock = {type: "Review Of"}
        const derivedFromMock = {type: "Derived From"}
        const derivativeMock = {type: "Derivative"}
        const createdByMock = {type: "Created By"}
        const createdMock = {type: "Created"}
        const mutations = [
            userMock,
            ingredientUsage1Mock,
            ingredientUsage2Mock,
            drinkMock,
            derivedFromMock,
            derivativeMock,
            createdMock,
            createdByMock,
            reviewMock,
            reviewOfMock,
        ]

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
                .expects("queueCreateEntry")
                .once()
                .withExactArgs('user', mockSecurityResult.user.payload.sub, {
                    name: mockSecurityResult.user.payload.name
                }, [])
                .returns(userMock),
            mockPersistence.expects("queueCreateEntry")
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
                ])
                .returns(ingredientUsage1Mock),
            mockPersistence.expects("queueCreateEntry")
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
                ])
                .returns(ingredientUsage2Mock),
            mockPersistence.expects("queueCreateEntry")
                .once()
                .withExactArgs('drink', sinon.match.any, {
                    "name": "Test Recipe",
                    "steps": "%5B%22Step%201%22%2C%22Step%202%22%2C%22Step%203%22%5D",
                    "picPath": "user/creation-pics/default.jpg"
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
                ])
                .returns(drinkMock),
            mockPersistence.expects("queueCreateEntry")
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
                ])
                .returns(reviewMock),
            mockPersistence.expects("queueCreateEdge")
                .once()
                .withExactArgs(sinon.match.any, sinon.match.any, 'review of', {})
                .returns(reviewOfMock),
            mockPersistence.expects("queueCreateEdge")
                .once()
                .withExactArgs(sinon.match.any, sinon.match.any, 'derived from', {})
                .returns(derivedFromMock),
            mockPersistence.expects("queueCreateEdge")
                .once()
                .withExactArgs(sinon.match.any, sinon.match.any, 'derivative', {})
                .returns(derivativeMock),
            mockPersistence.expects("queueCreateEdge")
                .once()
                .withExactArgs(sinon.match.any, "User", 'created by', {})
                .returns(createdByMock),
            mockPersistence.expects("queueCreateEdge")
                .once()
                .withExactArgs("User", sinon.match.any, 'created', {})
                .returns(createdMock),
            mockPersistence.expects("submitMutations")
                .once()
                .withExactArgs(mutations)
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

        var context = testUtil.getBaseContext()

        const request = testUtil.getBaseRequest({
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
        })

        const ingredientUsage1Mock = {type: "IngredientUsage1"}
        const ingredientUsage2Mock = {type: "IngredientUsage2"}
        const drinkMock = {type: "Drink"}
        const reviewMock = {type: "Review"}
        const reviewOfMock = {type: "Review Of"}
        const derivedFromMock = {type: "Derived From"}
        const derivativeMock = {type: "Derivative"}
        const createdByMock = {type: "Created By"}
        const createdMock = {type: "Created"}
        const mutations = [
            ingredientUsage1Mock,
            ingredientUsage2Mock,
            drinkMock,
            derivedFromMock,
            derivativeMock,
            createdMock,
            createdByMock,
            reviewMock,
            reviewOfMock,
        ]

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
            mockPersistence.expects("queueCreateEntry")
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
                ])
                .returns(ingredientUsage1Mock),
            mockPersistence.expects("queueCreateEntry")
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
                ])
                .returns(ingredientUsage2Mock),
            mockPersistence.expects("queueCreateEntry")
                .once()
                .withExactArgs('drink', sinon.match.any, {
                    "name": "Test Recipe",
                    "steps": "%5B%22Step%201%22%2C%22Step%202%22%2C%22Step%203%22%5D",
                    "picPath": "user/creation-pics/default.jpg"
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
                ])
                .returns(drinkMock),
            mockPersistence.expects("queueCreateEntry")
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
                ])
                .returns(reviewMock),
            mockPersistence.expects("queueCreateEdge")
                .once()
                .withExactArgs(sinon.match.any, sinon.match.any, 'review of', {})
                .returns(reviewOfMock),
            mockPersistence.expects("queueCreateEdge")
                .once()
                .withExactArgs(sinon.match.any, sinon.match.any, 'derived from', {})
                .returns(derivedFromMock),
            mockPersistence.expects("queueCreateEdge")
                .once()
                .withExactArgs(sinon.match.any, sinon.match.any, 'derivative', {})
                .returns(derivativeMock),
            mockPersistence.expects("queueCreateEdge")
                .once()
                .withExactArgs(sinon.match.any, "User", 'created by', {})
                .returns(createdByMock),
            mockPersistence.expects("queueCreateEdge")
                .once()
                .withExactArgs("User", sinon.match.any, 'created', {})
                .returns(createdMock),
            mockPersistence.expects("submitMutations")
                .once()
                .withExactArgs(mutations)
        ]
            
        await uut(context, request);

        expect(context.res.body.message).toEqual("Success");

        expectations.map(e => e.verify())

        mockSecurity.restore()
        mockPersistence.restore()
    });

    test('should handle a custom picture if included.', async function () {
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

        var context = testUtil.getBaseContext()

        const request = testUtil.getBaseRequest({
            "name": "Test Recipe",
            "picture": "user/creation-pics/someUser/somePic.png",
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
        })

        const ingredientUsage1Mock = {type: "IngredientUsage1"}
        const ingredientUsage2Mock = {type: "IngredientUsage2"}
        const drinkMock = {type: "Drink"}
        const reviewMock = {type: "Review"}
        const reviewOfMock = {type: "Review Of"}
        const derivedFromMock = {type: "Derived From"}
        const derivativeMock = {type: "Derivative"}
        const createdByMock = {type: "Created By"}
        const createdMock = {type: "Created"}
        const mutations = [
            ingredientUsage1Mock,
            ingredientUsage2Mock,
            drinkMock,
            derivedFromMock,
            derivativeMock,
            createdMock,
            createdByMock,
            reviewMock,
            reviewOfMock,
        ]

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
            mockPersistence.expects("queueCreateEntry")
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
                ])
                .returns(ingredientUsage1Mock),
            mockPersistence.expects("queueCreateEntry")
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
                ])
                .returns(ingredientUsage2Mock),
            mockPersistence.expects("queueCreateEntry")
                .once()
                .withExactArgs('drink', sinon.match.any, {
                    "name": "Test Recipe",
                    "steps": "%5B%22Step%201%22%2C%22Step%202%22%2C%22Step%203%22%5D",
                    "picPath": "user/creation-pics/someUser/somePic.png"
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
                ])
                .returns(drinkMock),
            mockPersistence.expects("queueCreateEntry")
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
                ])
                .returns(reviewMock),
            mockPersistence.expects("queueCreateEdge")
                .once()
                .withExactArgs(sinon.match.any, sinon.match.any, 'review of', {})
                .returns(reviewOfMock),
            mockPersistence.expects("queueCreateEdge")
                .once()
                .withExactArgs(sinon.match.any, sinon.match.any, 'derived from', {})
                .returns(derivedFromMock),
            mockPersistence.expects("queueCreateEdge")
                .once()
                .withExactArgs(sinon.match.any, sinon.match.any, 'derivative', {})
                .returns(derivativeMock),
            mockPersistence.expects("queueCreateEdge")
                .once()
                .withExactArgs(sinon.match.any, "User", 'created by', {})
                .returns(createdByMock),
            mockPersistence.expects("queueCreateEdge")
                .once()
                .withExactArgs("User", sinon.match.any, 'created', {})
                .returns(createdMock),
            mockPersistence.expects("submitMutations")
                .once()
                .withExactArgs(mutations)
        ]
            
        await uut(context, request);

        expect(context.res.body.message).toEqual("Success");

        expectations.map(e => e.verify())

        mockSecurity.restore()
        mockPersistence.restore()
    });
});
const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../../addrecipe/addrecipe')

function setupMockSecurity() {
    return sinon.mock(uut.__get__("security"))
}

function setupMockPersistence() {
    return sinon.mock(uut.__get__("cosmos"))
}

function setupMockEntityConversion() {
    return sinon.mock(uut.__get__("entityConversion"))
}

describe('Add Recipe Function Tests', function () {
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


    test('should correctly add the recipe and user if it doesnt already exist.', async function () {
        const mockSecurity = setupMockSecurity()
        const mockPersistence = setupMockPersistence()
        const mockEntityConversion = setupMockEntityConversion()

        const mockRecipe = {
            "name": "Some Recipe"
        }
        
        const mockFinalResult = {
            "name": "A Final Recipe"
        }

        const mockSecurityResult = {
            "success": true,
            "error": {
                "code": "Test Code",
                "message": "Test Message"
            },
            "user": {
                "payload": {
                    "sub": "User",
                    "name": "User Name"
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
                ]                
            }
        }

        const userMock = {type: "User"}
        const ingredientUsage1Mock = {type: "IngredientUsage1"}
        const ingredientUsage2Mock = {type: "IngredientUsage2"}
        const recipeMock = {type: "Recipe"}
        const createdByMock = {type: "Created By"}
        const createdMock = {type: "Created"}
        const mutations = [
            userMock,
            ingredientUsage1Mock,
            ingredientUsage2Mock,
            recipeMock,
            createdMock,
            createdByMock,
        ]

        const expectations = [
            mockSecurity
                .expects("checkToken")
                .once()
                .withArgs(context, request)
                .returns(mockSecurityResult),
            mockSecurity
                .expects("isAdmin")
                .once()
                .withArgs(mockSecurityResult.user)
                .returns(false),
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
                    "name": "Test Recipe Ingredient Usage #1"
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
                    "name": "Test Recipe Ingredient Usage #2"
                }, [
                    {
                        "id": "Ingredient-2",
                        "properties": {},
                        "relationship": "of"
                    },
                    {
                        "id": "Unit-2",
                        "properties": {
                            "unitAmount": "2.0"
                        },
                        "relationship": "amount"
                    }
                ])
                .returns(ingredientUsage2Mock),
            mockPersistence.expects("queueCreateEntry")
                .once()
                .withExactArgs('recipe', sinon.match.any, {
                    "name": "Test Recipe",
                    "steps": "[\"Step 1\",\"Step 2\",\"Step 3\"]",
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
                .returns(recipeMock),
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

        mockPersistence.restore()
        mockSecurity.restore()
        mockEntityConversion.restore()
    });

    test('should correctly add the recipe if authentication succeeds.', async function () {
        const mockSecurity = setupMockSecurity()
        const mockPersistence = setupMockPersistence()
        const mockEntityConversion = setupMockEntityConversion()

        const mockRecipe = {
            "name": "Some Recipe"
        }
        
        const mockFinalResult = {
            "name": "A Final Recipe"
        }

        const mockSecurityResult = {
            "success": true,
            "error": {
                "code": "Test Code",
                "message": "Test Message"
            },
            "user": {
                "payload": {
                    "sub": "User",
                    "name": "User Name"
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
                ]                
            }
        }

        const ingredientUsage1Mock = {type: "IngredientUsage1"}
        const ingredientUsage2Mock = {type: "IngredientUsage2"}
        const recipeMock = {type: "Recipe"}
        const createdByMock = {type: "Created By"}
        const createdMock = {type: "Created"}
        const mutations = [
            ingredientUsage1Mock,
            ingredientUsage2Mock,
            recipeMock,
            createdMock,
            createdByMock,
        ]

        const expectations = [
            mockSecurity
                .expects("checkToken")
                .once()
                .withArgs(context, request)
                .returns(mockSecurityResult),
            mockSecurity
                .expects("isAdmin")
                .once()
                .withArgs(mockSecurityResult.user)
                .returns(false),
            mockPersistence
                .expects("getPropertiesOfEntity")
                .once()
                .withArgs(mockSecurityResult.user.payload.sub, [])
                .returns({success: true}),
            mockPersistence.expects("queueCreateEntry")
                .once()
                .withExactArgs('ingredientUsage', sinon.match.any, {
                    "name": "Test Recipe Ingredient Usage #1"
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
                    "name": "Test Recipe Ingredient Usage #2"
                }, [
                    {
                        "id": "Ingredient-2",
                        "properties": {},
                        "relationship": "of"
                    },
                    {
                        "id": "Unit-2",
                        "properties": {
                            "unitAmount": "2.0"
                        },
                        "relationship": "amount"
                    }
                ])
                .returns(ingredientUsage2Mock),
            mockPersistence.expects("queueCreateEntry")
                .once()
                .withExactArgs('recipe', sinon.match.any, {
                    "name": "Test Recipe",
                    "steps": "[\"Step 1\",\"Step 2\",\"Step 3\"]",
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
                .returns(recipeMock),
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

        mockPersistence.restore()
        mockSecurity.restore()
        mockEntityConversion.restore()
    });
    
    test('should correctly handle a custom picture if included.', async function () {
        const mockSecurity = setupMockSecurity()
        const mockPersistence = setupMockPersistence()
        const mockEntityConversion = setupMockEntityConversion()

        const mockRecipe = {
            "name": "Some Recipe"
        }
        
        const mockFinalResult = {
            "name": "A Final Recipe"
        }

        const mockSecurityResult = {
            "success": true,
            "error": {
                "code": "Test Code",
                "message": "Test Message"
            },
            "user": {
                "payload": {
                    "sub": "User",
                    "name": "User Name"
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
                "picture": "user/creation-pics/someUser/somePic.jpg",
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
                ]                
            }
        }

        const ingredientUsage1Mock = {type: "IngredientUsage1"}
        const ingredientUsage2Mock = {type: "IngredientUsage2"}
        const recipeMock = {type: "Recipe"}
        const createdByMock = {type: "Created By"}
        const createdMock = {type: "Created"}
        const mutations = [
            ingredientUsage1Mock,
            ingredientUsage2Mock,
            recipeMock,
            createdMock,
            createdByMock,
        ]

        const expectations = [
            mockSecurity
                .expects("checkToken")
                .once()
                .withArgs(context, request)
                .returns(mockSecurityResult),
            mockSecurity
                .expects("isAdmin")
                .once()
                .withArgs(mockSecurityResult.user)
                .returns(false),
            mockPersistence
                .expects("getPropertiesOfEntity")
                .once()
                .withArgs(mockSecurityResult.user.payload.sub, [])
                .returns({success: true}),
            mockPersistence.expects("queueCreateEntry")
                .once()
                .withExactArgs('ingredientUsage', sinon.match.any, {
                    "name": "Test Recipe Ingredient Usage #1"
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
                    "name": "Test Recipe Ingredient Usage #2"
                }, [
                    {
                        "id": "Ingredient-2",
                        "properties": {},
                        "relationship": "of"
                    },
                    {
                        "id": "Unit-2",
                        "properties": {
                            "unitAmount": "2.0"
                        },
                        "relationship": "amount"
                    }
                ])
                .returns(ingredientUsage2Mock),
            mockPersistence.expects("queueCreateEntry")
                .once()
                .withExactArgs('recipe', sinon.match.any, {
                    "name": "Test Recipe",
                    "steps": "[\"Step 1\",\"Step 2\",\"Step 3\"]",
                    "picPath": "user/creation-pics/someUser/somePic.jpg"
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
                .returns(recipeMock),
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

        mockPersistence.restore()
        mockSecurity.restore()
        mockEntityConversion.restore()
    });
});
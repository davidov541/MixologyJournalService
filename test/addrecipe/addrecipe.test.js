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
                    "sub": "User"
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
            mockPersistence.expects("createEntryOfKind")
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
                ]),
            mockPersistence.expects("createEntryOfKind")
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
                ]),
            mockPersistence.expects("createEntryOfKind")
                .once()
                .withExactArgs('recipe', sinon.match.any, {
                    "name": "Test Recipe",
                    "steps": "[\"Step 1\",\"Step 2\",\"Step 3\"]"
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
            mockPersistence.expects("createEdge")
                .once()
                .withExactArgs(sinon.match.any, "User", 'created by', {}),
            mockPersistence.expects("createEdge")
                .once()
                .withExactArgs("User", sinon.match.any, 'created', {}),
            mockPersistence.expects("getAllDescendentsOfEntity")
                .once()
                .withExactArgs(sinon.match.any)
                .returns(mockRecipe),
            mockEntityConversion.expects("processRecipe")
                .once()
                .withExactArgs(mockRecipe)
                .returns(mockFinalResult)
        ]
            
        await uut(context, request);

        const expectedResponse = {
            "body": mockFinalResult
        }
        expect(context.res).toEqual(expectedResponse);

        expectations.map(e => e.verify())
    });
});
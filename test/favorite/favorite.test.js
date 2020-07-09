const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../../favorite/favorite')

function setupMockSecurity() {
    return sinon.mock(uut.__get__("security"))
}

function setupMockPersistence() {
    return sinon.mock(uut.__get__("cosmos"))
}

describe('Favorite Drink Function Tests', function () {
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

    test('should correctly add the favorite if authentication succeeds with no existing favorites.', async function () {
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
                "recipeId": "Mock Recipe",
                "drinkId": "Mock Drink",
                "isFavorited": true
            }
        }
        
        const createEdgeMock = {type: "Create Favorite"}
        const mutations = [createEdgeMock]

        const expectations = [
            mockSecurity
                .expects("checkToken")
                .once()
                .withArgs(context, request)
                .returns(mockSecurityResult),
            mockPersistence.expects("getAllIncomingEdgesOfKind")
                .once()
                .withExactArgs('Mock Recipe', 'favorite', [])
                .returns([]),
            mockPersistence.expects("queueCreateEdge")
                .once()
                .withExactArgs('Mock Drink', 'Mock Recipe', 'favorite', [])
                .returns(createEdgeMock),
            mockPersistence.expects("submitMutations")
                .once()
                .withExactArgs(mutations),
        ]
            
        await uut(context, request);

        expect(context.res.body.name).toEqual(request.body.name);

        expectations.map(e => e.verify())
        
        mockPersistence.restore()
        mockSecurity.restore()
    });

    test('should correctly add the favorite if authentication succeeds with an existing favorite.', async function () {
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
                "recipeId": "Mock Recipe",
                "drinkId": "Mock Drink",
                "isFavorited": true
            }
        }

        const existingFavorite = {id: 'Existing Favorite Edge'}
        
        const deleteEdgeMock = {type: "Delete Favorite"}
        const createEdgeMock = {type: "Create Favorite"}
        const mutations = [deleteEdgeMock, createEdgeMock]

        const expectations = [
            mockSecurity
                .expects("checkToken")
                .once()
                .withArgs(context, request)
                .returns(mockSecurityResult),
            mockPersistence.expects("getAllIncomingEdgesOfKind")
                .once()
                .withExactArgs('Mock Recipe', 'favorite', [])
                .returns([existingFavorite]),
            mockPersistence.expects("queueDeleteEdge")
                .once()
                .withExactArgs(existingFavorite.id)
                .returns(deleteEdgeMock),
            mockPersistence.expects("queueCreateEdge")
                .once()
                .withExactArgs('Mock Drink', 'Mock Recipe', 'favorite', [])
                .returns(createEdgeMock),
            mockPersistence.expects("submitMutations")
                .once()
                .withExactArgs(mutations),
        ]
            
        await uut(context, request);

        expect(context.res.body.name).toEqual(request.body.name);

        expectations.map(e => e.verify())
        
        mockPersistence.restore()
        mockSecurity.restore()
    });

    test('should do nothing if we ask to disable a favorite that doesnt exist.', async function () {
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
                "recipeId": "Mock Recipe",
                "drinkId": "Mock Drink",
                "isFavorited": false
            }
        }
        
        const createEdgeMock = {type: "Create Favorite"}
        const mutations = [createEdgeMock]

        const expectations = [
            mockSecurity
                .expects("checkToken")
                .once()
                .withArgs(context, request)
                .returns(mockSecurityResult),
            mockPersistence.expects("getAllIncomingEdgesOfKind")
                .once()
                .withExactArgs('Mock Recipe', 'favorite', [])
                .returns([]),
        ]
            
        await uut(context, request);

        expect(context.res.body.name).toEqual(request.body.name);

        expectations.map(e => e.verify())
        
        mockPersistence.restore()
        mockSecurity.restore()
    });

    test('should correctly delete the existing favorite if favorite is disabled.', async function () {
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
                "recipeId": "Mock Recipe",
                "drinkId": "Mock Drink",
                "isFavorited": false
            }
        }

        const existingFavorite = {id: 'Existing Favorite Edge'}
        
        const deleteEdgeMock = {type: "Delete Favorite"}
        const mutations = [deleteEdgeMock]

        const expectations = [
            mockSecurity
                .expects("checkToken")
                .once()
                .withArgs(context, request)
                .returns(mockSecurityResult),
            mockPersistence.expects("getAllIncomingEdgesOfKind")
                .once()
                .withExactArgs('Mock Recipe', 'favorite', [])
                .returns([existingFavorite]),
            mockPersistence.expects("queueDeleteEdge")
                .once()
                .withExactArgs(existingFavorite.id)
                .returns(deleteEdgeMock),
            mockPersistence.expects("submitMutations")
                .once()
                .withExactArgs(mutations),
        ]
            
        await uut(context, request);

        expect(context.res.body.name).toEqual(request.body.name);

        expectations.map(e => e.verify())
        
        mockPersistence.restore()
        mockSecurity.restore()
    });
});
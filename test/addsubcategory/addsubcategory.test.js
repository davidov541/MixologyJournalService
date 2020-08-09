const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../../addsubcategory/addsubcategory')

function setupMockSecurity() {
    return sinon.mock(uut.__get__("security"))
}

function setupMockPersistence() {
    return sinon.mock(uut.__get__("cosmos"))
}

describe('Add Subcategory Function Tests', function () {
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

    test('should fail if a user that is not an administrator tries to add a subcategory.', async function () {
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
                "name": "Test Ingredient"
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
                .returns(false)
        ]
            
        await uut(context, request);

        const expectedResponse = {
            "status": 401,
            "body": "User cannot add subcategories."
        }
        expect(context.res).toEqual(expectedResponse);

        expectations.map(e => e.verify())

        mockPersistence.restore()
        mockSecurity.restore()
    });

    test('should correctly add the subcategory if authentication succeeds.', async function () {
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
                "name": "Test Subcategory",
                "category": "Test Category"
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
                .returns(true),
            mockPersistence.expects("createEntryOfKind")
                .once()
                .withExactArgs('subcategory', sinon.match.any, {
                    "name": request.body.name
                }, [
                    {
                        id: request.body.category,
                        relationship: "subcategory",
                        properties: {}
                    }
                ]),
        ]
            
        await uut(context, request);

        expect(context.res.body.name).toEqual(request.body.name);

        expectations.map(e => e.verify())

        mockPersistence.restore()
        mockSecurity.restore()
    });
});
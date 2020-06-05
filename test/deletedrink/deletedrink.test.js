const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../../deletedrink/deletedrink')

function setupMockSecurity() {
    return sinon.mock(uut.__get__("security"))
}

function setupMockPersistence() {
    return sinon.mock(uut.__get__("cosmos"))
}

describe('Delete Drink Function Tests', function () {
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

    test('should not delete the drink if authentication succeeds for a non-admin user.', async function () {
        const mockSecurity = setupMockSecurity()
        
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
                "id": "Drink-1"
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
            status: 401,
            body: "User cannot complete this operation."
        }
        expect(context.res).toEqual(expectedResponse);

        expectations.map(e => e.verify())

        mockSecurity.restore()
    });

    test('should correctly delete the drink if authentication succeeds for an admin user.', async function () {
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
                "id": "Drink-1"
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
            mockPersistence.expects("deleteEntry")
                .once()
                .withExactArgs(request.body.id, ['uses'])
        ]
            
        await uut(context, request);

        const expectedResponse = {
            status: 200,
            body: "Success"
        }
        expect(context.res).toEqual(expectedResponse);

        expectations.map(e => e.verify())

        mockSecurity.restore()
        mockPersistence.restore()
    });
});
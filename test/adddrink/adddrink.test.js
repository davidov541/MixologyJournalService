const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../../adddrink/adddrink')

function setupMockSecurity() {
    return sinon.mock(uut.__get__("security"))
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
    });
});
const rewire = require('rewire');
const sinon = require('sinon');
const multipart = require('parse-multipart')

const uut = rewire('../../upload/upload')

function setupMockSecurity() {
    return sinon.mock(uut.__get__("security"))
}

function setupMockADLS() {
    return sinon.mock(uut.__get__("adls"))
}

describe('Upload File Function Tests', function () {
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

    /*
    test('should correctly upload the file if authentication succeeds.', async function () {
        const mockSecurity = setupMockSecurity()
        const mockADLS = setupMockADLS()

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

        const fileContent = "Some Content"
        const fullBody = multipart.DemoData()
        const request = {
            "body": fullBody,
            "headers": {
                "content-type": "text/plain; boundary=------WebKitFormBoundaryvef1fLxmoUdYZWXp"
            }
        }

        const expectations = [
            mockSecurity
                .expects("checkToken")
                .once()
                .withArgs(context, request)
                .returns(mockSecurityResult),
                mockADLS.expects("uploadFile")
                .once()
                .withExactArgs(fileContent.length, 'foo.png'),
        ]
            
        await uut(context, request);

        expectations.map((e) => e.verify());
        
        mockPersistence.restore()
        mockSecurity.restore()
    });
    */
});
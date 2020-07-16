const rewire = require('rewire');
const sinon = require('sinon');

const util = require('../util/testutil')

const uut = rewire('../../addpicture/addpicture')

function setupMockSecurity() {
    return sinon.mock(uut.__get__("security"))
}

function setupMockADLS() {
    return sinon.mock(uut.__get__("adls"))
}

describe('Add Pictures Function Tests', function () {
    test('should return an error if the authentication fails.', async function () {
        const mockSecurity = setupMockSecurity()
        
        const mockResult = {
            "success": false,
            "error": {
                "code": "Test Code",
                "message": "Test Message"
            }
        }

        var context = util.getBaseContext()

        const request = util.getBaseRequest({})

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

        var context = util.getBaseContext()

        const fileContent = new Buffer("Hello World", 'utf-8')
        const fullBody = "----------------------------497983131095136311264163\r\n" +
        'Content-Disposition: form-data; name="file"; filename="uploadtest.txt"' + "\r\n" +
        "Content-Type: text/plain\r\n" +
        "\r\n" +
        "Hello World\r\n" +
        "----------------------------497983131095136311264163--"
        
        const request = util.getBaseRequest(new Buffer(fullBody,'utf-8'))
        request.headers = {
                "content-type": "multipart/form-data; boundary=--------------------------497983131095136311264163"
            }

        const expectations = [
            mockSecurity
                .expects("checkToken")
                .once()
                .withArgs(context, request)
                .returns(mockSecurityResult),
                mockADLS.expects("createDirectoryIfNotExists")
                .once()
                .withExactArgs('creation-pics/User'),
                mockADLS.expects("uploadFile")
                .once()
                .withExactArgs(fileContent, sinon.match.any),
        ]
           
        await uut(context, request);

        expectations.map((e) => e.verify());
        
        mockADLS.restore()
        mockSecurity.restore()
    });
});
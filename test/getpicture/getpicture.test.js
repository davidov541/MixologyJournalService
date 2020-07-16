const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../../getpicture/getpicture')

function setupMockSecurity() {
    return sinon.mock(uut.__get__("security"))
}

function setupMockADLS() {
    return sinon.mock(uut.__get__("adls"))
}

describe('Get Picture Function Tests', function () {
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
            log: function (msg) {console.log(msg)}        
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

    test('should correctly return a SAS for a file if authentication succeeds.', async function () {
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
            log: function (msg) {console.log(msg)}        
        }

        const filePath = "Some File"
        const fileSAS = "SAS Token"
        const request = {
            "body": {
                filePath: filePath
            },
            "headers": {
                "content-type": "multipart/form-data; boundary=--------------------------497983131095136311264163"
            }
        }

        const expectations = [
            mockSecurity
                .expects("checkToken")
                .once()
                .withArgs(context, request)
                .returns(mockSecurityResult),
            mockADLS.expects("getSASForFile")
                .once()
                .withExactArgs(filePath)
                .returns(fileSAS),
        ]
           
        await uut(context, request);

        expectations.map((e) => e.verify());
        
        mockADLS.restore()
        mockSecurity.restore()
    });
});
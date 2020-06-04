const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../../util/security');
const jwt = uut.__get__("jwt")();

function setupMockJWT() {
    const jwtMock = sinon.mock(jwt)
    
    return jwtMock
}

function setupMockConfig(signingToken) {
    const config = {
        "signingToken": signingToken
    }
    uut.__set__("config", () => config)
    return config
}

describe('Security and JWT Interface Tests', function () {
    test('should properly validate a correct token.', async function () {
        const fakeToken = "someToken"
        const fakeSigningToken = "someSigningToken"
        const fakeUser = {
            "username": "someUser"
        }
        const fakeDToken = {}

        const jwtMock = setupMockJWT();
        setupMockConfig(fakeSigningToken);

        jwtMock.expects("decode").once().withArgs(fakeToken, sinon.match.any).returns(fakeDToken)
        jwtMock.expects("verify").once().withArgs(fakeToken, fakeSigningToken, sinon.match.any).returns(fakeUser)

        const req = {
            "headers": {
                "authorization": "Bearer " + fakeToken
            }
        }

        const context = {
            "log": (message) => {console.log(message)}
        }

        await uut.checkToken(context, req)

        jwtMock.verify()
    })
    
    test('should reject an expired token.', async function () {
        const fakeToken = "someToken"
        const fakeSigningToken = "someSigningToken"
        const fakeError = "Some Error"
        const fakeDToken = {}
        const expected = {
            "error": {
                code: 403,
                message: "Invalid token: " + fakeError
            },
            "success": false,
            "user": {}
        }

        const jwtMock = setupMockJWT();
        setupMockConfig(fakeSigningToken);

        jwtMock.expects("decode").once().withArgs(fakeToken, sinon.match.any).returns(fakeDToken)
        jwtMock.expects("verify").once().withArgs(fakeToken, fakeSigningToken, sinon.match.any).throws(fakeError)

        const req = {
            "headers": {
                "authorization": "Bearer " + fakeToken
            }
        }

        const context = {
            "log": (message) => {console.log(message)}
        }

        const result = await uut.checkToken(context, req)

        jwtMock.verify()

        expect(result).toEqual(expected)
    })
    
    test("should reject a token that can't be decoded.", async function () {
        const fakeToken = "someToken"
        const fakeSigningToken = "someSigningToken"
        const fakeError = "Some Error"
        const expected = {
            "error": {
                code: 403,
                message: "Cannot decode token: " + fakeError
            },
            "success": false,
            "user": {}
        }

        const jwtMock = setupMockJWT();
        setupMockConfig(fakeSigningToken);

        jwtMock.expects("decode").once().withArgs(fakeToken, sinon.match.any).throws(fakeError)
        jwtMock.expects("verify").never()
        const req = {
            "headers": {
                "authorization": "Bearer " + fakeToken
            }
        }

        const context = {
            "log": (message) => {console.log(message)}
        }

        const result = await uut.checkToken(context, req)

        jwtMock.verify()

        expect(result).toEqual(expected)
    })
    
    test("should reject an authorization header that is too short.", async function () {
        const fakeSigningToken = "someSigningToken"
        const expected = {
            "error": {
                code: 401,
                message: "Authentication required for this API."
            },
            "success": false,
            "user": {}
        }

        const jwtMock = setupMockJWT();
        setupMockConfig(fakeSigningToken);

        jwtMock.expects("decode").never()
        jwtMock.expects("verify").never()
        const req = {
            "headers": {
                "authorization": "Bearer"
            }
        }

        const context = {
            "log": (message) => {console.log(message)}
        }

        const result = await uut.checkToken(context, req)

        jwtMock.verify()

        expect(result).toEqual(expected)
    })
    
    test("should reject an authorization header that is too long.", async function () {
        const fakeSigningToken = "someSigningToken"
        const expected = {
            "error": {
                code: 401,
                message: "Authentication required for this API."
            },
            "success": false,
            "user": {}
        }

        const jwtMock = setupMockJWT();
        setupMockConfig(fakeSigningToken);

        jwtMock.expects("decode").never()
        jwtMock.expects("verify").never()
        const req = {
            "headers": {
                "authorization": "Bearer one two"
            }
        }

        const context = {
            "log": (message) => {console.log(message)}
        }

        const result = await uut.checkToken(context, req)

        jwtMock.verify()

        expect(result).toEqual(expected)
    })
    
    test("should reject an invalid authorization header.", async function () {
        const fakeSigningToken = "someSigningToken"
        const expected = {
            "error": {
                code: 401,
                message: "Only JWTs are accepted for this API."
            },
            "success": false,
            "user": {}
        }

        const jwtMock = setupMockJWT();
        setupMockConfig(fakeSigningToken);

        jwtMock.expects("decode").never()
        jwtMock.expects("verify").never()
        const req = {
            "headers": {
                "authorization": "Something here"
            }
        }

        const context = {
            "log": (message) => {console.log(message)}
        }

        const result = await uut.checkToken(context, req)

        jwtMock.verify()

        expect(result).toEqual(expected)
    })
    
    test("should reject an empty authorization header.", async function () {
        const fakeSigningToken = "someSigningToken"
        const expected = {
            "error": {
                code: 401,
                message: "No access token was found."
            },
            "success": false,
            "user": {}
        }

        const jwtMock = setupMockJWT();
        setupMockConfig(fakeSigningToken);

        jwtMock.expects("decode").never()
        jwtMock.expects("verify").never()
        const req = {
            "headers": {
                "authorization": "Bearer "
            }
        }

        const context = {
            "log": (message) => {console.log(message)}
        }

        const result = await uut.checkToken(context, req)

        jwtMock.verify()

        expect(result).toEqual(expected)
    })
})
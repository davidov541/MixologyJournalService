const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../../listrecipes/listrecipes')

function setupMockSecurity() {
    return sinon.mock(uut.__get__("security"))
}

function setupMockPersistence() {
    return sinon.mock(uut.__get__("cosmos"))
}

function setupMockConversion() {
    return sinon.mock(uut.__get__("entityConversion"))
}

async function runSuccessfulListTest(securitySuccess) {
    const mockSecurity = setupMockSecurity()
    const mockPersistence = setupMockPersistence()
    const mockConversion = setupMockConversion()

    var mockSecurityResult = {
        "success": securitySuccess,
        "error": {
            "code": "Test Code",
            "message": "Test Message"
        }
    }
    if (securitySuccess) {
        mockSecurityResult.user = {
            "payload": {
                "sub": "User"
            }
        }
    }

    var context = {   
        res: {},
        log: function (msg) {}        
    }

    const request = {}

    const mockList = [
        {
            "name": "Recipe 1",
            "user": "User",
            "isBuiltIn": false
        },
        {
            "name": "Recipe 2",
            "user": "ef5375ad-6d92-4571-a999-999aa494ff13",
            "isBuiltIn": true
        },
        {
            "name": "Recipe 3",
            "user": "Some Other User",
            "isBuiltIn": false
        }
    ]

    const expectations = [
        mockSecurity
            .expects("checkToken")
            .once()
            .withArgs(context, request)
            .returns(mockSecurityResult),
        mockPersistence.expects("getAllDescendentsOfKind")
            .once()
            .withExactArgs('recipe')
            .returns(JSON.parse(JSON.stringify(mockList))),
        mockConversion.expects("processRecipe")
            .once()
            .withExactArgs(mockList[0], mockSecurityResult.user)
            .returns(JSON.parse(JSON.stringify(mockList[0]))),
        mockConversion.expects("processRecipe")
            .once()
            .withExactArgs(mockList[1], mockSecurityResult.user)
            .returns(JSON.parse(JSON.stringify(mockList[1]))),
        mockConversion.expects("processRecipe")
            .once()
            .withExactArgs(mockList[2], mockSecurityResult.user)
            .returns(JSON.parse(JSON.stringify(mockList[2])))
    ]
        
    await uut(context, request);

    var expectedBody = [/*mockList[1]*/]
    if (securitySuccess) {
        expectedBody = [mockList[0]/*, mockList[1]*/]
    }
    expect(context.res.body).toEqual(expectedBody);

    expectations.map(e => e.verify())

    mockSecurity.restore()
    mockPersistence.restore()
    mockConversion.restore()
}

describe('List Recipes Function Tests', function () {
    test('should correctly list recipes if authentication succeeds.', async function () {
        await runSuccessfulListTest(true)
    });

    test('should correctly list recipes even if authentication fails.', async function () {
        await runSuccessfulListTest(false)
    });
});
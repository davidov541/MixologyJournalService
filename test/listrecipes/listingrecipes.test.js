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

    const mockSecurityResult = {
        "success": securitySuccess,
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

    const request = {}

    const mockList = [
        {
            "name": "Ingredient 1",
            "user": "User"
        },
        {
            "name": "Ingredient 2",
            "user": "root"
        },
        {
            "name": "Ingredient 3",
            "user": "Some Other User"
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
            .returns(mockList),
        mockConversion.expects("processRecipe")
            .once()
            .withExactArgs(mockList[0], mockSecurityResult.user)
            .returns(mockList[0]),
        mockConversion.expects("processRecipe")
            .once()
            .withExactArgs(mockList[1], mockSecurityResult.user)
            .returns(mockList[1]),
        mockConversion.expects("processRecipe")
            .once()
            .withExactArgs(mockList[2], mockSecurityResult.user)
            .returns(mockList[2])
    ]
        
    await uut(context, request);

    expect(context.res.body).toEqual([mockList[0], mockList[1]]);

    expectations.map(e => e.verify())

    mockSecurity.restore()
    mockPersistence.restore()
    mockConversion.restore()
}

describe('List Ingredients Function Tests', function () {
    test('should correctly list ingredients if authentication succeeds.', async function () {
        await runSuccessfulListTest(true)
    });

    test('should correctly list ingredients even if authentication fails.', async function () {
        await runSuccessfulListTest(false)
    });
});
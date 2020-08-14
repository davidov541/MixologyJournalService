const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../../listdrinks/listdrinks')

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
            "name": "Drink 1",
            "user": "User"
        },
        {
            "name": "Drink 2",
            "user": "root"
        },
        {
            "name": "Drink 3",
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
            .withExactArgs('drink')
            .returns(mockList),
        mockConversion.expects("processDrink")
            .once()
            .withExactArgs(mockList[0])
            .returns(mockList[0]),
        mockConversion.expects("processDrink")
            .once()
            .withExactArgs(mockList[1])
            .returns(mockList[1]),
        mockConversion.expects("processDrink")
            .once()
            .withExactArgs(mockList[2])
            .returns(mockList[2])
    ]
        
    await uut(context, request);

    var expectedBody = []
    if (securitySuccess) {
        expectedBody = [mockList[0]]
    }
    expect(context.res.body).toEqual(expectedBody);

    expectations.map(e => e.verify())

    mockSecurity.restore()
    mockPersistence.restore()
    mockConversion.restore()
}

describe('List Drinks Function Tests', function () {
    test('should correctly list drinks if authentication succeeds.', async function () {
        await runSuccessfulListTest(true)
    });

    test('should correctly list drinks even if authentication fails.', async function () {
        await runSuccessfulListTest(false)
    });
});
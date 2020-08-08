const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../../listingredients/listingredients')

function setupMockSecurity() {
    return sinon.mock(uut.__get__("security"))
}

function setupMockPersistence() {
    return sinon.mock(uut.__get__("cosmos"))
}

async function runSuccessfulListTest(securitySuccess) {
    const mockSecurity = setupMockSecurity()
    const mockPersistence = setupMockPersistence()

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
            "plural": "Plural Ingredient 1"
        },
        {
            "name": "Ingredient 2"
        }
    ]

    const expected = [
        {
            "name": "Ingredient 1",
            "plural": "Plural Ingredient 1"
        },
        {
            "name": "Ingredient 2",
            "plural": "Ingredient 2"
        }
    ]

    const expectations = [
        mockSecurity
            .expects("checkToken")
            .once()
            .withArgs(context, request)
            .returns(mockSecurityResult),
        mockPersistence.expects("getEntriesOfKind")
            .once()
            .withExactArgs('ingredient', ['name', 'plural'])
            .returns(mockList),
    ]

    await uut(context, request);

    expect(context.res.body).toEqual(expected);

    expectations.map(e => e.verify())

    mockSecurity.restore()
    mockPersistence.restore()
}

describe('List Ingredients Function Tests', function () {
    test('should correctly list ingredients if authentication succeeds.', async function () {
        await runSuccessfulListTest(true)
    });

    test('should correctly list ingredients even if authentication fails.', async function () {
        await runSuccessfulListTest(false)
    });
});
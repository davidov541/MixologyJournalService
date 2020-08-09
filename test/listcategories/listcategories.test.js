const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../../listcategories/listcategories')

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
        }
    }

    var context = {   
        res: {},
        log: function (msg) {}        
    }

    const request = {}

    const mockList = [
        {
            "name": "Category 1"
        },
        {
            "name": "Category 2"
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
            .withExactArgs('category', ['name'])
            .returns(mockList),
    ]
        
    await uut(context, request);

    expect(context.res.body).toEqual(mockList);

    expectations.map(e => e.verify())

    mockSecurity.restore()
    mockPersistence.restore()
}

describe('List Categories Function Tests', function () {
    test('should correctly list categories if authentication succeeds.', async function () {
        await runSuccessfulListTest(true)
    });

    test('should correctly list categories even if authentication fails.', async function () {
        await runSuccessfulListTest(false)
    });
});
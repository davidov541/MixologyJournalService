const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../../listunits/listunits')

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
            "name": "Unit 1",
            "plural": "Units 1",
            "format": "Format 1"
        },
        {
            "name": "Unit 2",
            "plural": "Units 2",
            "format": "Format 2"
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
            .withExactArgs('unit', ['name', 'plural', 'format'])
            .returns(mockList),
    ]
        
    await uut(context, request);

    expect(context.res.body).toEqual(mockList);

    expectations.map(e => e.verify())

    mockSecurity.restore()
    mockPersistence.restore()
}

describe('List Units Function Tests', function () {
    test('should correctly list units if authentication succeeds.', async function () {
        await runSuccessfulListTest(true)
    });

    test('should correctly list units even if authentication fails.', async function () {
        await runSuccessfulListTest(false)
    });
});
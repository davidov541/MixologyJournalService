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

    const mockRawResults = [
        {
          "parent": {
            "id": "1",
            "label": "category",
            "name": [
              "Category 1"
            ]
          },
          "children": [
            {
              "id": "1a",
              "label": "subcategory",
              "name": [
                "Subcategory 1"
              ]
            },
            {
              "id": "1b",
              "label": "subcategory",
              "name": [
                "Subcategory 2"
              ]
            }
          ]
        },
        {
          "parent": {
            "id": "2",
            "label": "category",
            "name": [
              "Category 2"
            ]
          },
          "children": [
            {
              "id": "2a",
              "label": "subcategory",
              "name": [
                "Subcategory 3"
              ]
            }
          ]
        }
      ]

    const expected = mockRawResults;

    const expectations = [
        mockSecurity
            .expects("checkToken")
            .once()
            .withArgs(context, request)
            .returns(mockSecurityResult),
        mockPersistence.expects("runCustomQuery")
            .once()
            .withExactArgs(sinon.match.any)
            .returns(mockRawResults),
    ]
        
    await uut(context, request);

    expect(context.res.body).toEqual(expected);

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
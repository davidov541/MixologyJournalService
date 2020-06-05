const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../../listunits/listunits')

function setupMockSecurity() {
    return sinon.mock(uut.__get__("security"))
}

function setupMockPersistence() {
    return sinon.mock(uut.__get__("cosmos"))
}

describe('List Units Function Tests', function () {
    test('should correctly list units if authentication succeeds.', async function () {
        const mockSecurity = setupMockSecurity()
        const mockPersistence = setupMockPersistence()

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
            log: function (msg) {}        
        }

        const request = {
            "body": {
                "name": "Test Ingredient"
            }
        }

        const mockList = [
            {
                "name": "Unit 1"
            },
            {
                "name": "Unit 2"
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
                .withExactArgs('unit', ['name'])
                .returns(mockList),
        ]
            
        await uut(context, request);

        expect(context.res.body).toEqual(mockList);

        expectations.map(e => e.verify())

        mockSecurity.restore()
        mockPersistence.restore()
    });

    test('should correctly list units even if authentication fails.', async function () {
        const mockSecurity = setupMockSecurity()
        const mockPersistence = setupMockPersistence()

        const mockSecurityResult = {
            "success": false,
            "error": {
                "code": "Test Code",
                "message": "Test Message"
            }
        }

        var context = {   
            res: {},
            log: function (msg) {}        
        }

        const request = {
            "body": {
                "name": "Test Ingredient"
            }
        }

        const mockList = [
            {
                "name": "Unit 1"
            },
            {
                "name": "Unit 2"
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
                .withExactArgs('unit', ['name'])
                .returns(mockList),
        ]
            
        await uut(context, request);

        expect(context.res.body).toEqual(mockList);

        expectations.map(e => e.verify())

        mockSecurity.restore()
        mockPersistence.restore()
    });
});
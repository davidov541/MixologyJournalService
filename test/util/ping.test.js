const helloworld = require('../../ping/helloworld')

describe('Ping Function Tests', function () {
    test('should return successfully at all times.', async function () {
        var context = {   
            res: {},
            log: function (msg) {}        
        }

        const request = {}

        await helloworld(context, request);

        const expectedResponse = {
            body: "Hello World",
            status: 200
        }
        expect(context.res).toEqual(expectedResponse);
    });
});
const rewire = require('rewire');
const sinon = require('sinon');

const uut = rewire('../../util/servicebus');

function setupMockBusClient() {
    const sendSpy = sinon.spy();

    const senderMock = {
        send: sendSpy
    }

    const createSenderStub = sinon.stub()
    createSenderStub.returns(senderMock)

    const closeQueueSpy = sinon.spy()

    const queueMock = {
        createSender: createSenderStub,
        close: closeQueueSpy
    }

    const createQueueClientStub = sinon.stub()
    createQueueClientStub.returns(queueMock)

    const closeClientSpy = sinon.spy()

    const serviceBusMock = {
        createQueueClient: createQueueClientStub,
        close: closeClientSpy
    }

    uut.__set__("createServiceBusClient", () => serviceBusMock);

    return {"createSender": createSenderStub, "createQueueClient": createQueueClientStub, "send": sendSpy}
}

function checkOpenAndCloseOfServiceBus(spies) {
    expect(spies.createSender.called).toBeTruthy();
    expect(spies.createSender.callCount).toBe(1);
    
    expect(spies.createQueueClient.called).toBeTruthy();
    expect(spies.createQueueClient.callCount).toBe(1);
}

describe('Service Bus Interface Tests', function () {
    test('should properly send a single mutation.', async function () {
        const spies = setupMockBusClient();
        
        const testObject = {
            "someProperty": "someValue"
        }

        await uut.sendMutation(testObject)
        
        checkOpenAndCloseOfServiceBus(spies)

        const expectedBody = {
            environment: process.env.ENVIRONMENT,
            commands: [
                {
                    "someProperty": "someValue",
                    "environment": process.env.ENVIRONMENT
                }
            ]
        }
        const expected = [
            {
                body: JSON.stringify(expectedBody),
                label: 'creationRequest'
            }
        ]

        expect(spies.send.called).toBeTruthy();
        expect(spies.send.callCount).toBe(1);
        expect(spies.send.args[0]).toEqual(expected)
    })
    test('should properly send multiple mutations.', async function () {
        const spies = setupMockBusClient();
        
        const testObject = [
            {
                "someProperty": "someValue"
            },
            {
                "someProperty": "someValue2"
            }
        ]

        await uut.sendMutations(testObject)
        
        checkOpenAndCloseOfServiceBus(spies)

        const expectedBody = {
            environment: process.env.ENVIRONMENT,
            commands: [
                {
                    "someProperty": "someValue",
                    "environment": process.env.ENVIRONMENT
                },
                {
                    "someProperty": "someValue2",
                    "environment": process.env.ENVIRONMENT
                }
            ]
        }
        const expected = [
            {
                body: JSON.stringify(expectedBody),
                label: 'creationRequest'
            }
        ]

        expect(spies.send.called).toBeTruthy();
        expect(spies.send.callCount).toBe(1);
        expect(spies.send.args[0]).toEqual(expected)
    })
})
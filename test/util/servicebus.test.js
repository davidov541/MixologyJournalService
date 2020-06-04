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
    test('should properly send a message it is given.', async function () {
        const spies = setupMockBusClient();
        
        const testObject = {
            "someProperty": "someValue"
        }

        await uut.sendCreationMessage(testObject)
        
        checkOpenAndCloseOfServiceBus(spies)

        const expected = [
            {
                body: JSON.stringify(testObject),
                label: 'creationRequest'
            }
        ]

        expect(spies.send.called).toBeTruthy();
        expect(spies.send.callCount).toBe(1);
        expect(spies.send.args[0]).toEqual(expected)
    })
})
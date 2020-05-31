const { ServiceBusClient } = require("@azure/service-bus"); 

const connectionString = process.env.mixologyJournal_RootManageSharedAccessKey_SERVICEBUS;
const queueName = process.env.queueName;

var createServiceBusClient = () => ServiceBusClient.createFromConnectionString(connectionString)

async function sendCreationMessage(entity) {
    const sbClient = createServiceBusClient();
    const queueClient = sbClient.createQueueClient(queueName);
    const sender = queueClient.createSender();
    try {
        const message = {
            body: JSON.stringify(entity),
            label: 'creationRequest',
        };
        console.log(`Sending message: ${JSON.stringify(message)}`);
        await sender.send(message);
    }
    finally {
        await queueClient.close();
        await sbClient.close();
    }
}

exports.sendCreationMessage = sendCreationMessage;
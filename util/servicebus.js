const { ServiceBusClient } = require("@azure/service-bus"); 

const connectionString = process.env.mixologyJournal_RootManageSharedAccessKey_SERVICEBUS;
const queueName = process.env.queueName;

async function sendCreationMessage(entity) {
    const sbClient = ServiceBusClient.createFromConnectionString(connectionString);
    const queueClient = sbClient.createQueueClient(queueName);
    const sender = queueClient.createSender();
    try {
        const message = {
            body: JSON.stringify(entity),
            label: 'creationRequest',
        };
        console.log(`Sending message: ${JSON.stringify(message)}`);
        await sender.send(message);
        await queueClient.close();
    }
    finally {
        await sbClient.close();
    }
}

exports.sendCreationMessage = sendCreationMessage;
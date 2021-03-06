const { ServiceBusClient } = require("@azure/service-bus"); 

const connectionString = process.env.mixologyJournal_RootManageSharedAccessKey_SERVICEBUS;
const queueName = process.env.queueName;

var createServiceBusClient = () => ServiceBusClient.createFromConnectionString(connectionString)

async function sendMutation(entity) {
    await sendMutations([entity])
}

async function sendMutations(entities) {
    const fullMessage = {
        environment: process.env.ENVIRONMENT,
        commands: entities
    }
    const sbClient = createServiceBusClient();
    const queueClient = sbClient.createQueueClient(queueName);
    const sender = queueClient.createSender();
    try {
        const message = {
            body: fullMessage,
            label: 'creationRequest',
        };
        console.log(`Sending message to creationRequest queue: ${JSON.stringify(message)}`);
        await sender.send(message);
    }
    finally {
        await queueClient.close();
        await sbClient.close();
    }
}

exports.sendMutation = sendMutation;
exports.sendMutations = sendMutations;
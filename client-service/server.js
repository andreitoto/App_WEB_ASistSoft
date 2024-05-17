const express = require('express');
const axios = require('axios');
const amqp = require('amqplib');

const app = express();
const PORT = 3001;

const clientNames = ['dan', 'vasile dan', 'alin'];

var queue;
var conn;
var channel;

async function sendToQueue(clientName) {
    const queue = 'clientInfo';
    const message = `Companie:${clientName}; Numar de angajati:25,000`;

    const conn = await amqp.connect('amqp://user:password@rabbitmq');
    const channel = await conn.createChannel();
    await channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(message));
    console.log(" [x] Sent %s", message);

    await channel.close();
    await conn.close();
}

app.get('/', async (req, res) => {
    if (!clientNames.includes(req.query.name)) {
        res.status(204).send('Client not found');
        return;
    }

    try {
        const response = await axios.get(`http://microservice2:3002/wealth?name=${req.query.name}`);
        const wealth = response.data.wealth;
        queue = 'clientInfo';

        conn = await amqp.connect('amqp://user:password@rabbitmq');
        channel = await conn.createChannel();
        await channel.assertQueue(queue, { durable: false });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        //Wait for message from Microservice2
        const msgResponse = await new Promise((res) => {
            channel.consume(queue, (msg) => {
                if (msg !== null) {
                    console.log(" [x] Received %s", msg.content.toString());
                    channel.ack(msg);
                    res(msg.content.toString());
                }
            });
        });

        res.json(`${wealth}, ${msgResponse}`);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching data from Microservice 2', error: error.message });
    }
    finally {
        await conn.close();
    }
});

app.get('/wealth', async (req, res) => {
    const clientName = req.query.name; // Numele clientului primit ca parametru
    res.json({ wealth: " Valoare estimata: $USD 70,000,000" });

    // Trimiterea mesajului după răspunsul HTTP
    try {
        await sendToQueue(clientName);
    }
    catch (e) {
        console.log(e);
    }
});

app.listen(PORT, () => {
    console.log(`Serverul Client rulând pe http://localhost:${PORT}`);
});

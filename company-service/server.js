const express = require('express');
const axios = require('axios');
const amqp = require('amqplib');

const app = express();
const PORT = 3002;

// Conectarea la RabbitMQ și trimiterea unui mesaj
async function sendToQueue(clientName) {
    const queue = 'clientInfo';
    const message = `Client:${clientName}; Functie in companie:CEO.`;

    const conn = await amqp.connect('amqp://user:password@rabbitmq');
    const channel = await conn.createChannel();
    await channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(message));
    console.log(" [x] Sent %s", message);

    await channel.close();
    await conn.close();
}

app.get('/', async (req, res) => {
    const clientName = req.query.name; // Numele clientului primit ca parametru
    res.json({ wealth: "$USD 10,000,000" });

    // Trimiterea mesajului după răspunsul HTTP
    try {
        await sendToQueue(clientName);
    }
    catch (e) {
        console.log(e);
    }
});

app.listen(PORT, () => {
    console.log(`Microservice 2 running on http://localhost:${PORT}`);
});

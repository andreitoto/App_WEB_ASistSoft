const express = require('express');
const axios = require('axios');
const amqp = require('amqplib');

const app = express();
const PORT = 3001;

var queue;
var conn;
var channel;

app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`http://microservice2:3002?name=${req.query.name}`);
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

app.listen(PORT, () => {
    console.log(`Serverul Client rulând pe http://localhost:${PORT}`);
});

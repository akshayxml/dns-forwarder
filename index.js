const http = require('http');
const yargs = require('yargs');
const dgram = require('dgram');
const DnsForwarder = require('./src/DnsForwarder');
const dns = require("dns");

const argv = yargs
    .option('port', {
        alias: 'p',
        description: 'Port number for server',
        type: 'integer',
    })
    .argv;
const port = argv.port || 1053;
const server = dgram.createSocket('udp4');
const dnsForwarder = new DnsForwarder();

server.bind(port, () => {
    console.log('UDP server listening on port ', port);
});

server.on('message', (msg, rinfo) => {
    console.log(`Received message from ${rinfo.address}:${rinfo.port}:`);
    // dnsForwarder.parse(msg)

    let client = dgram.createSocket('udp4');

    // Send message and handle response within a promise
    let sendPromise = new Promise((resolve, reject) => {
        client.send(msg, 53, '8.8.8.8', (error) => {
            if (error) {
                console.error('Error sending message:', error);
                client.close();
                reject(error);
            } else {
                // Attach message listener to client within the promise
                // to ensure it's ready for potential responses
                client.on('message', (msg, rinfo) => {
                    console.log(`Received response message from ${rinfo.address}:${rinfo.port}: ${msg}`);
                    dnsForwarder.parse(msg);

                    server.send(Buffer.from(msg), rinfo.port, rinfo.address, (err) => {
                        if (err) {
                            console.error(`Error sending response: ${err.message}`);
                        } else {
                            console.log('Response sent');
                        }
                    });

                    client.close(); // Close the socket after handling the response
                });

                resolve(); // Resolve the promise after attaching the listener
            }
        });
    });

    // Handle promise resolution or rejection
    sendPromise.then(() => {
        // Removed duplicate log message
    }).catch((error) => {
        console.error('Error sending message:', error);
    });

    client.on('error', (error) => {
        console.error('Error:', error);
        client.close();
    });
});


dnsForwarder.stop()
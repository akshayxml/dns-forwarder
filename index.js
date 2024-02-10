const yargs = require('yargs');
const dgram = require('dgram');
const DnsForwarder = require('./src/DnsForwarder');

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

server.on('message', async (requestMessage, requestInfo) => {
    console.log(`Received request message from ${requestInfo.address}:${requestInfo.port}:`);

    let response = dnsForwarder.get(requestMessage);
    if (response === null) {
        try {
            await dnsForwarder.forward(requestMessage);
            response = dnsForwarder.get(requestMessage);
        } catch (error) {
            console.error('Error forwarding request:', error);
            dnsForwarder.close();
            return;
        }
    }

    server.send(Buffer.from(response), requestInfo.port, requestInfo.address, (err) => {
        if (err) {
            console.error(`Error sending response: ${err.message}`);
            server.close();
        } else {
            console.log('Response sent to client');
        }
    });
});
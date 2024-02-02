const http = require('http');
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

server.on('message', (msg, rinfo) => {
    console.log(`Received message from ${rinfo.address}:${rinfo.port}:`);
    dnsForwarder.parse(msg)

    server.send(Buffer.from('Message received!'), rinfo.port, rinfo.address, (err) => {
        if (err) {
            console.error(`Error sending response: ${err.message}`);
        } else {
            console.log('Response sent');
        }
    });
});
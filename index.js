const http = require('http');
const yargs = require('yargs');

const argv = yargs
    .option('port', {
        alias: 'p',
        description: 'Port number for server',
        type: 'integer',
    })
    .argv;

const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello, this is the dns resolver!\n');
});

const port = argv.port || 1053;

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
const StaticFunctions = require('./utils/StaticFunctions')

class DnsForwarder {
    constructor() {
        this.staticFunctions = new StaticFunctions();
    }

    parse(request){
        console.log(request)
        console.log(request[0])
        console.log(this.staticFunctions.asciiToHex(request[0]))
    }
}

module.exports = DnsForwarder;
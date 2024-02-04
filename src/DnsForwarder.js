const StaticFunctions = require('./utils/StaticFunctions')
const DnsParser = require('./utils/DnsParser')
class DnsForwarder {
    constructor() {
        this.staticFunctions = new StaticFunctions();
        this.dnsParser = new DnsParser()
    }

    parse(request){
        this.dnsParser.parse(request);
        console.log("Request received -->")
        console.log("Header - ")
        console.log(this.dnsParser.header)
        console.log("Questions - ")
        console.log(this.dnsParser.questions)
        console.log("Answers - ")
        console.log(this.dnsParser.answers)
        console.log("Authorities - ")
        console.log(this.dnsParser.authorities)
        console.log("Additionals - ")
        console.log(this.dnsParser.additionals)
        console.log("-------++++-------")
    }
}

module.exports = DnsForwarder;
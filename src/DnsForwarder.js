const DnsParser = require('./utils/DnsParser')
const dgram = require('dgram');

class DnsForwarder {
    constructor() {
        this.dnsResolutionCache = {}
        this.client = dgram.createSocket('udp4');
    }

    forward(request){
        return new Promise((resolve, reject) => {
            this.client.send(request, 53, '8.8.8.8', (error) => {
                console.log("request sent")
                if (error) {
                    console.error('Error sending message:', error);
                    this.client.close();
                } else {
                    this.client.on('message', (responseMsg, responseInfo) => {
                        console.log(`Received response message from ${responseInfo.address}:${responseInfo.port}: ${responseMsg}`);
                        this.set(responseMsg);
                    });
                }
            });
        });
    }

    get(request){
        this.dnsParser = new DnsParser()
        this.dnsParser.parse(request);
        // console.log("Request received -->")
        // console.log("Header - ")
        // console.log(this.dnsParser.header)
        // console.log("Questions - ")
        // console.log(this.dnsParser.questions)
        // console.log("Answers - ")
        // console.log(this.dnsParser.answers)
        // console.log("Authorities - ")
        // console.log(this.dnsParser.authorities)
        // console.log("Additionals - ")
        // console.log(this.dnsParser.additionals)
        // console.log("-------++++-------")
        let serialisedQuestion = this.dnsParser.getSerialisedQuestion(this.dnsParser.question)
        console.log(serialisedQuestion)
        if(serialisedQuestion in this.dnsResolutionCache){
            return this._updateId(request, serialisedQuestion)
        }
        return null;
    }

    set(request){
        this.dnsParser = new DnsParser()
        this.dnsParser.parse(request);
        let serialisedQuestion = this.dnsParser.getSerialisedQuestion(this.dnsParser.question)
        this.dnsResolutionCache[serialisedQuestion] = request;
    }

    _updateId(request, cacheKey){
        let response = this.dnsResolutionCache[cacheKey];
        response[0] = request[0];
        response[1] = request[1];
        return response;
    }

    close(){
        this.client.close();
    }
}

module.exports = DnsForwarder;
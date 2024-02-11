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
                console.log("Request sent to dns server")
                if (error) {
                    console.error('Error sending message:', error);
                    this.client.close();
                } else {
                    this.client.once('message', (responseMsg, responseInfo) => {
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
        let serialisedQuestion = this.dnsParser.getSerialisedQuestion(this.dnsParser.question)
        if(serialisedQuestion in this.dnsResolutionCache && !this._checkIfRecordExpired(this.dnsResolutionCache, serialisedQuestion)){
            return this._updateId(request, serialisedQuestion)
        }
        return null;
    }

    set(response){
        this.dnsParser = new DnsParser()
        this.dnsParser.parse(response);
        console.log(this.dnsParser.answers[0].ttl)
        let serialisedQuestion = this.dnsParser.getSerialisedQuestion(this.dnsParser.question)
        this.dnsResolutionCache[serialisedQuestion] = {response: response,
                                                        expiryTime: this._getTimeInSeconds() + this.dnsParser.answers[0].ttl};
    }

    _updateId(request, cacheKey){
        let response = this.dnsResolutionCache[cacheKey]['response'];
        response[0] = request[0];
        response[1] = request[1];
        return response;
    }

    _getTimeInSeconds(){
        return Math.floor(new Date().getTime() / 1000);
    }

    _checkIfRecordExpired(cache, cacheKey){
        return 'expiryTime' in cache[cacheKey] && cache[cacheKey]['expiryTime'] < this._getTimeInSeconds();
    }

    close(){
        this.client.close();
    }
}

module.exports = DnsForwarder;
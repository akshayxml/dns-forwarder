class DnsParser{
    headerFields = [
        'id',
        'flags',
        'qdcount',
        'ancount',
        'nscount',
        'arcount'
    ];
    questionFields = ['qname', 'qtype', 'qclass']
    resourceFields = ["name", "type", "class", "ttl", "rdlength", "rdata"];
    parse(request) {
        this.header = {}
        this.questions = []
        this.answers = []
        this.authorities = []
        this.additionals = []
        this._index = parseHeader(request, this._index, this.header, this.headerFields);
        for(let i=0; i<this.header.qdcount; i++){
            this.question = {};
            this._index = parseQuestion(request, this._index, this.question, this.questionFields);
            this.questions.push(this.question)
        }
        for(let i=0; i<this.header.ancount; i++){
            this.answer = {}
            this._index = parseResource(request, this._index, this.answer, this.resourceFields);
            this.answers.push(this.answer)
        }
        for(let i=0; i<this.header.nscount; i++){
            this.authority = {}
            this._index = parseResource(request, this._index, this.authority, this.resourceFields);
            this.authorities.push(this.authority)
        }
        for(let i=0; i<this.header.arcount; i++){
            this.additional = {}
            this._index = parseResource(request, this._index, this.additional, this.resourceFields);
            this.additionals.push(this.additional)
        }
    }

    getSerialisedQuestion(question){
        let response = ""
        this.questionFields.forEach(field => {
            response += question[field] + ":"
        });
        return response
    }
}

function parseHeader(request, index, header, headerFields){
    for (index = 0; index < headerFields.length; index++) {
        header[headerFields[index]] = parseInt(request[index * 2].toString() + request[index * 2 + 1].toString());
    }
    return index*2;
}

function parseQuestion(request, index, question, questionFields){
    let {updatedIndex, domainName} = getDomainName(request, index);
    index = updatedIndex;

    question[questionFields[0]] = domainName.substring(0, domainName.length-1);
    question[questionFields[1]] = parseInt(request[index].toString() + request[index+1].toString());
    index+=2;
    question[questionFields[2]] = parseInt(request[index].toString() + request[index+1].toString());
    return index+2
}

function parseResource(request, index, resource, resourceFields){
    let {updatedIndex, domainName} = getDomainName(request, index);
    index = updatedIndex;
    resource[resourceFields[0]] = domainName.substring(0, domainName.length - 1);

    // Parse type, class
    for (let i = 1; i <= 2; i++) {
        resource[resourceFields[i]] = parseInt(request[index].toString() + request[index + 1].toString());
        index += 2;
    }

    // Parse TTL
    resource[resourceFields[3]] = parseInt(request[index].toString() + request[index + 1].toString() +
                                                    request[index + 2].toString() + request[index + 3].toString());
    index += 4;

    // Parse RDLENGTH
    resource[resourceFields[4]] = parseInt(request[index].toString() + request[index + 1].toString());
    index += 2;

    // Parse RDATA
    let rData = "";
    const rdLength = resource[resourceFields[4]];
    for (let i = 0; i < rdLength; i++) {
        rData += String.fromCharCode(request[index]);
        index++;
    }
    resource[resourceFields[5]] = rData;

    return index;
}

function getDomainName(request, index){
    let domainName = "";
    if((request[index] & 0xC0) === 0xC0){ //handle message compression
        let {_, domainName} = getDomainName(request, request[index+1]);
        index+=2;
        return {updatedIndex: index, domainName};
    }
    while (request[index] !== 0) {
        const labelLength = request[index];
        index++;

        let label = '';
        for (let i = 0; i < labelLength; i++) {
            label += String.fromCharCode(request[index]);
            index++;
        }
        domainName += label + '.';
    }
    index++;

    return {updatedIndex: index,
            domainName: domainName}
}

module.exports = DnsParser
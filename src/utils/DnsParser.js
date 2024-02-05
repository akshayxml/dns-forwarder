class DnsParser{
    parse(request) {
        this.header = {}
        this.questions = []
        this.answers = []
        this.authorities = []
        this.additionals = []
        this._index = parseHeader(request, this._index, this.header);
        for(let i=0; i<this.header.qdcount; i++){
            this.question = {};
            this._index = parseQuestion(request, this._index, this.question);
            this.questions.push(this.question)
        }
        console.log(request)
        console.log(this.header)
        for(let i=0; i<this.header.ancount; i++){
            this.answer = {}
            this._index = parseResource(request, this._index, this.answer);
            this.answers.push(this.answer)
        }
        console.log(this.answers)
        for(let i=0; i<this.header.nscount; i++){
            this.authority = {}
            this._index = parseResource(request, this._index, this.authority);
            this.authorities.push(this.authority)
        }
        for(let i=0; i<this.header.arcount; i++){
            this.additional = {}
            this._index = parseResource(request, this._index, this.additional);
            this.additionals.push(this.additional)
        }
        console.log(this.additionals)
    }
}

function parseHeader(request, index, header){
    const headerFields = [
        'id',
        'flags',
        'qdcount',
        'ancount',
        'nscount',
        'arcount'
    ];
    for (index = 0; index < headerFields.length; index++) {
        header[headerFields[index]] = parseInt(request[index * 2].toString() + request[index * 2 + 1].toString());
    }
    return index*2;
}

function parseQuestion(request, index, question){
    const questionFields = ['qname', 'qtype', 'qclass']
    let {updatedIndex, domainName} = getDomainName(request, index);
    index = updatedIndex;

    question[questionFields[0]] = domainName.substring(0, domainName.length-1);
    question[questionFields[1]] = parseInt(request[index].toString() + request[index+1].toString());
    index+=2;
    question[questionFields[2]] = parseInt(request[index].toString() + request[index+1].toString());
    return index+2
}

function parseResource(request, index, resource){
    const resourceFields = ["name", "type", "class", "ttl", "rdlength", "rdata"];
    console.log(request)
    console.log(index)
    console.log(request[index])
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
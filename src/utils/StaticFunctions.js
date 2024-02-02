function StaticFunctions() {
}
StaticFunctions.prototype = {
    asciiToHex: function(str){
        if(!isNaN(str)){
            return str.toString(16);
        }
        else{
            return Buffer.from(str, 'utf-8').toString('hex');
        }
    }
}

module.exports = StaticFunctions;
const Comrade = require('./Comrade');

class Commissar extends Comrade {
    url;
    
    constructor ({id, wallet, publicKey, url}) {
        super({id, wallet, publicKey});
        this.url = url || "http://localhost:3000";
    }

    print () {
        return `  :: I am PoliticalCommissar#${this.id} and my wallet has ¢${this.balance}`
    }
}

module.exports = Commissar;
const Comrade = require('./Comrade');

class Commissar extends Comrade {
    print () {
        return `  :: I am PoliticalCommissar#${this.id} and my wallet has ¢${this.balance}`
    }
}

module.exports = Commissar;
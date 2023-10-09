
class Comrade {
    id;
    wallet;
    publicKey;

    constructor({id, wallet, publicKey}) {
        this.id = id || 0;
        this.wallet = wallet || 0;
        this.publicKey = publicKey;
    }

    get balance () {
        return this.wallet;
    }

    pay () {
        const range = Math.random();
        let amount = 0;
        //console.log(`  >> Range: ${range}`);
        if (range < 0.5) {
            amount = Math.floor(this.wallet * 0.05);
            //console.log(`  ==> range < 0.5 : 5% `);
        } else if (range < 0.65) {
            amount = Math.floor(this.wallet * 0.1);
            //console.log(`  ==> 0.5 < range < 0.65 : 10% `);
        } else if (range < 0.75) {
            amount = Math.floor(this.wallet * 0.15);
            //console.log(`  ==> 0.65 < range < 0.75 : 15% `);
        } else if (range < 0.85) {
            amount = Math.floor(this.wallet * 0.2);
            //console.log(`  ==> 0.75 < range < 0.85 : 20% `);
        } else if (range < 0.95) {
            amount = Math.floor(this.wallet * 0.35);
            //console.log(`  ==> 0.85 < range < 0.95 : 35% `);
        } else if (range < 0.99) {
            amount = Math.floor(this.wallet * 0.5);
            //console.log(`  ==> 0.95 < range < 0.99 : 50% `);
        } else if (range < 1.0) {
            amount = Math.floor(this.wallet * 0.75);
            //console.log(`  ==> 0.99 < range < 1.0 : 75% `);
        }
        this.wallet -= amount;
        //console.log(`  >> Amount: ${amount}  >> Wallet: ${this.wallet}`);
        return amount;
    }

    debit (amount) {
        this.wallet -= amount;
    }

    credit (amount) {
        this.wallet += amount;
    }

    print () {
        return `  -- I am comrade#${this.id} and my wallet has ¢${this.balance}`
    }
}

module.exports = Comrade;
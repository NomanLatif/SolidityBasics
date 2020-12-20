// Mocha Unit Testing
const FlipContract = artifacts.require("FlipContract");
const truffleAssert = require("truffle-assertions");

contract("FlipContract", async function(accounts){
    
    let instance;

    before(async function(){
        instance = await FlipContract.deployed();
    });

    it("should be possible to bet an amount of 0.01 Ether or higher", async function(){
        await truffleAssert.passes(instance.flip({value: web3.utils.toWei("0.01","ether"), from:accounts[1]}), truffleAssert.ErrorType.REVERT);
    }); 
    it("shouldn't be possible to take a bet less than 0.01 Ether ", async function(){
        await truffleAssert.fails(instance.flip({value: web3.utils.toWei("0.005","ether"), from:accounts[1]}), truffleAssert.ErrorType.REVERT);
    });
    it("shouldn't be possible make higher bad as contract funding", async function(){
        await truffleAssert.fails(instance.flip({value: web3.utils.toWei("6","ether"), from:accounts[1]}), truffleAssert.ErrorType.REVERT);
    });
    it("shouldn't be possible to withdraw contract funds for non contract owner", async function(){
        await truffleAssert.fails(instance.withdrawAll({from:accounts[1]}), truffleAssert.ErrorType.REVERT);
    });
    it("should be possible to withdraw contract funds for contract owner", async function(){
        await truffleAssert.passes(instance.withdrawAll({from:accounts[0]}), truffleAssert.ErrorType.REVERT);
    });

});
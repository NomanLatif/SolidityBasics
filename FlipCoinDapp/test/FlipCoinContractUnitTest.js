// Mocha Unit Testing
const FlipCoinContract = artifacts.require("FlipCoinContract");
const truffleAssert = require("truffle-assertions");

contract("FlipCoinContract", async function(accounts){
    let instance;
    before(async function(){
        instance = await FlipCoinContract.deployed();
    });

    it("should be possible to set betting amount", async function(){
        //await instance.setBettingAmount({value: web3.utils.toWei("0.5","ether"), from:accounts[0]});
        await instance.setBettingAmount(web3.utils.toWei("0.5","ether"), {from:accounts[0]});
        let bettingAmount = await debug(instance.bettingAmount());
        let floatBettingAmount = parseFloat(bettingAmount);
        console.log("betting amout floating = " + floatBettingAmount);
        assert(floatBettingAmount == web3.utils.toWei("0.5", "ether"))
    });

    it("should not be possible to set betting amount other than owner", async function(){
        await truffleAssert.fails(instance.setBettingAmount(web3.utils.toWei("0.5","ether"), {from:accounts[1]}), truffleAssert.ErrorType.REVERT);
    });

    it("should be possible to change owner", async function(){
        await instance.transferOwnership(accounts[1], {from: accounts[0]});
        let newOwner = await instance.contractOwner();
        assert(newOwner === accounts[1], "Owner should be " + accounts[1] + " but is " + newOwner);
        // change back the owner for other tests
        await instance.transferOwnership(accounts[0], {from: accounts[1]});
    });

    it("Only owner should be able to change the owner", async function(){
        await truffleAssert.fails(instance.transferOwnership(accounts[2], {from: accounts[1]}), truffleAssert.ErrorType.REVERT);
    });

    it("should be possible to fund the contract", async function(){
        await truffleAssert.passes(instance.withdrawAll({from: accounts[0]}));
        await instance.fundContract({value: web3.utils.toWei("0.5","ether"), from:accounts[0]})
        let balance = await instance.getContractBalance();
        assert(balance == web3.utils.toWei("0.5","ether"), "Balance should be " + web3.utils.toWei("0.5","ether") + " But was " + balance);
    });

    it("Should be possible to withdraw all balance", async function(){
        await truffleAssert.passes(instance.withdrawAll({from: accounts[0]}));
    });

    it("Only owner should be able to withdraw all balance", async function(){
        await truffleAssert.fails(instance.withdrawAll({from: accounts[1]}), truffleAssert.ErrorType.REVERT);
    });
});
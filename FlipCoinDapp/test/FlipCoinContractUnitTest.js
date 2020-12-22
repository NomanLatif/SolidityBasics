// Mocha Unit Testing
const FlipCoinContract = artifacts.require("FlipCoinContract");
const truffleAssert = require("truffle-assertions");

contract("FlipCoinContract", async function(accounts){
    let instance;
    before(async function(){
        instance = await FlipCoinContract.deployed();
    });

    it("should be possible to set betting amount", async function(){
        await instance.setBettingAmount(web3.utils.toWei("0.5","ether"), {from:accounts[0]});
        let bettingAmount = await debug(instance.bettingAmount());
        let floatBettingAmount = parseFloat(bettingAmount);
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

    it("Should be possible to withdraw specific amount", async function(){
        await instance.withdrawAll({from: accounts[0]});
        await instance.fundContract({value: web3.utils.toWei("0.5","ether"), from:accounts[0]})
        let balance = await instance.getContractBalance();
        await instance.withdraw(web3.utils.toWei("0.2", "ether"), {from: accounts[0]});
        balance = await instance.getContractBalance();
        assert(balance == web3.utils.toWei("0.3","ether"), "Balance should be " + web3.utils.toWei("0.3","ether") + " But was " + balance);
    });

    it("It should revert if withdraw amount is more than balance", async function(){
        await truffleAssert.fails(instance.withdraw(web3.utils.toWei("5", "ether"), {from: accounts[0]}), truffleAssert.ErrorType.REVERT);
    });

    it("Only owner should be able to withdraw amount", async function(){
        await truffleAssert.fails(instance.withdraw(web3.utils.toWei("0.2", "ether"), {from: accounts[1]}), truffleAssert.ErrorType.REVERT);
    });

    it("should be possible to pause betting", async function(){
        await instance.pauseBetting(true);
        let isBettingPaused = await instance.pauseBettingAfterCurrentRound({from: accounts[0]});
        assert(isBettingPaused, "Betting should be paused")
    });

    it("Only owner should be able to pause betting", async function(){
        await truffleAssert.fails(instance.pauseBetting(true, {from:accounts[1]}), truffleAssert.ErrorType.REVERT);
    });

    it("should be able to bet", async function(){
        let balanceBefore = await instance.getContractBalance();
        let betAmount = web3.utils.toWei("0.5", "ether");
        let tx = await instance.bet(1, {value: betAmount, from: accounts[1]});
        truffleAssert.eventEmitted(tx, 'betTaken', (ev) => {
            return ev.player === accounts[1] && parseFloat(ev.betAmount) == parseFloat(betAmount) && ev.choice == 1;
        });

        let balanceAfter = await instance.getContractBalance();
        let expectedBalance = parseFloat(balanceBefore) + parseFloat(betAmount);
        assert(balanceAfter == expectedBalance, "Balance was " + balanceAfter + " But it should be " + expectedBalance);
        
        let betBalanceHead = await instance.betBalance(0);
        let betBalanceTail = await instance.betBalance(1);
        assert(betBalanceHead == 0 && parseFloat(betBalanceTail) == parseFloat(betAmount));

        let result = await instance.getBetDetails(accounts[1]);
        assert(result[0] == 1 &&  result[1] == betAmount, "Bet details are not correct" );
    });

    it("should be able to flip", async function(){
        let balanceBefore = await instance.getContractBalance();
        let betAmount = web3.utils.toWei("0.5", "ether");
        await instance.bet(1, {value: betAmount, from: accounts[1]});
        await instance.bet(1, {value: betAmount, from: accounts[2]});
        await instance.bet(1, {value: betAmount, from: accounts[3]});
        await instance.bet(0, {value: betAmount, from: accounts[4]});
        await instance.bet(0, {value: betAmount, from: accounts[5]});
        await instance.bet(1, {value: betAmount, from: accounts[6]});

        await instance.flip({from: accounts[0]});
    });
});
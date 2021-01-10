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
        let totalBetAmountBefore = await instance.totalBetAmount();
        let betAmount = web3.utils.toWei("0.5", "ether");
        let expectedTotalBetAmount = parseFloat(totalBetAmountBefore) + (parseFloat(betAmount) * 2); 
        await instance.bet(1, {value: betAmount, from: accounts[1]});
        let tx = await instance.bet(0, {value: betAmount, from: accounts[1]});
        truffleAssert.eventEmitted(tx, 'betTaken', (ev) => {
            return ev.player === accounts[1] && parseFloat(ev.totalBetAmount) == expectedTotalBetAmount && ev.choice == 0;
        });

        let balanceAfter = await instance.getContractBalance();
        let expectedBalance = parseFloat(balanceBefore) + expectedTotalBetAmount;
        assert(balanceAfter == expectedBalance, "Balance was " + balanceAfter + " But it should be " + expectedBalance);
        
        let totalBetAmount = await instance.totalBetAmount();
        assert(parseFloat(totalBetAmount) == expectedTotalBetAmount);

        let addedPlayerForTail = await instance.playersForTail(0);
        assert(addedPlayerForTail == accounts[1], "Player for tail is not added" );

        let addedPlayerForHead = await instance.playersForHead(0);
        assert(addedPlayerForHead == accounts[1], "Player for head is not added" );

        await instance.flip({from: accounts[0]});// for clearing the values;
    });

    it("should be able to flip", async function(){
        let balanceBefore = await instance.getContractBalance();
        let betAmount = web3.utils.toWei("0.5", "ether");
        await instance.bet(1, {value: betAmount, from: accounts[2]});
        await instance.bet(1, {value: betAmount, from: accounts[3]});
        await instance.bet(1, {value: betAmount, from: accounts[4]});
        await instance.bet(0, {value: betAmount, from: accounts[5]});
        await instance.bet(0, {value: betAmount, from: accounts[6]});
        await instance.bet(1, {value: betAmount, from: accounts[7]});

        let balanceAfter = await instance.getContractBalance();
        let expectedTotalBetAmount = parseFloat(betAmount) * 6;
        let expectedBalance = parseFloat(balanceBefore) + expectedTotalBetAmount;
        let players = await instance.getPlayers();
        assert(players[0][0] == accounts[5], "player not found");
        assert(players[0][1] == accounts[6], "player not found");
        assert(players[1][0] == accounts[2], "player not found");
        assert(players[1][1] == accounts[3], "player not found");
        assert(players[1][2] == accounts[4], "player not found");
        assert(players[1][3] == accounts[7], "player not found");
        assert(balanceAfter == expectedBalance, "Balance was " + balanceAfter + " But it should be " + expectedBalance);
        
        let numberOfHeadBets = await instance.getNumberOfHeadBets();
        let numberOfTailBets = await instance.getNumberOfTailBets();
        assert(numberOfHeadBets == 2 && numberOfTailBets == 4, "Number of bets are not matching");

        let totalBetAmount = await instance.totalBetAmount();
        assert(totalBetAmount == expectedTotalBetAmount, "Bet amount is not matching"); 
        
        // Flip the coin
        let tx = await instance.flip({from: accounts[0]});
        var result;
        truffleAssert.eventEmitted(tx, 'flipped', async (ev) => {
            result = ev.result;            
            return true;
        });

        balanceAfter = await instance.getContractBalance();
        assert(balanceAfter == expectedBalance, "After flip Balance was " + balanceAfter + " But it should be " + expectedBalance);
        
        let totalBetAmountAfterFlip = await instance.totalBetAmount();
        assert(totalBetAmountAfterFlip == 0, "After flip bet amount is not matching");
        
        numberOfHeadBets = await instance.getNumberOfHeadBets();
        numberOfTailBets = await instance.getNumberOfTailBets();
        assert(numberOfHeadBets == 0 && numberOfTailBets == 0, "After flip Number of bets are not matching");

        let account2Balance = await instance.playerBalance(accounts[2]);
        let account3Balance = await instance.playerBalance(accounts[3]);
        let account4Balance = await instance.playerBalance(accounts[4]);
        let account5Balance = await instance.playerBalance(accounts[5]);
        let account6Balance = await instance.playerBalance(accounts[6]);
        let account7Balance = await instance.playerBalance(accounts[7]);
        
        if (result == 0 ) {
            let expectedPlayerBalance = (parseFloat(totalBetAmount) - (parseFloat(totalBetAmount) * 0.1)) / 2;
            assert(account2Balance == 0, "Player2 balance was " + account2Balance + " but it should be " + expectedPlayerBalance);
            assert(account3Balance == 0, "Player3 balance was " + account3Balance + " but it should be " + expectedPlayerBalance);
            assert(account4Balance == 0, "Player4 balance was " + account4Balance + " but it should be " + expectedPlayerBalance);
            assert(account5Balance == expectedPlayerBalance, "Player5 balance was " + account5Balance + " but it should be " + expectedPlayerBalance);
            assert(account6Balance == expectedPlayerBalance, "Player6 balance was " + account6Balance + " but it should be " + expectedPlayerBalance);
            assert(account7Balance == 0, "Player7 balance was " + account7Balance + " but it should be " + expectedPlayerBalance);
        }
        else {
            let expectedPlayerBalance = (parseFloat(totalBetAmount) - (parseFloat(totalBetAmount) * 0.1)) / 4;
            assert(account2Balance == expectedPlayerBalance, "Player2 balance was " + account2Balance + " but it should be " + expectedPlayerBalance);
            assert(account3Balance == expectedPlayerBalance, "Player3 balance was " + account3Balance + " but it should be " + expectedPlayerBalance);
            assert(account4Balance == expectedPlayerBalance, "Player4 balance was " + account4Balance + " but it should be " + expectedPlayerBalance);
            assert(account5Balance == 0, "Player5 balance was " + account5Balance + " but it should be " + expectedPlayerBalance);
            assert(account6Balance == 0, "Player6 balance was " + account6Balance + " but it should be " + expectedPlayerBalance);
            assert(account7Balance == expectedPlayerBalance, "Player7 balance was " + account7Balance + " but it should be " + expectedPlayerBalance);
        }
    });

    it("only owner should be able to flip the coin", async function(){
        await truffleAssert.fails(instance.flip({from:accounts[1]}), truffleAssert.ErrorType.REVERT);
    });

    it("Should be possible for user to withdraw all of his balance", async function(){
        let player2Balance = await instance.playerBalance(accounts[2]);
        let player3Balance = await instance.playerBalance(accounts[3]);
        let player4Balance = await instance.playerBalance(accounts[4]);

        if (parseFloat(player2Balance) > 0) {
            await instance.withdrawAllUserBalance({from: accounts[2]});
        }
        if (parseFloat(player3Balance) > 0) {
            await instance.withdrawAllUserBalance({from: accounts[3]});
        }
        if (parseFloat(player4Balance) > 0) {
            await instance.withdrawAllUserBalance({from: accounts[4]});
        }

        let betAmount = web3.utils.toWei("0.5", "ether");
        await instance.bet(0, {value: betAmount, from: accounts[2]});
        await instance.bet(0, {value: betAmount, from: accounts[3]});
        await instance.bet(1, {value: betAmount, from: accounts[4]});
        let totalBetAmountBeforeFlip = await instance.totalBetAmount();
        let tx = await instance.flip({from: accounts[0]});
        var result;
        truffleAssert.eventEmitted(tx, 'flipped', async (ev) => {
            result = ev.result;            
            return true;
        });

        let totalBetAmountAfterFlip = await instance.totalBetAmount();
        assert(totalBetAmountAfterFlip == 0, "Total bet amount should be zero after flip");    

        let contractBeforeWithdraw = await instance.getContractBalance();
        let account2BalanceBeforeWithdraw = await instance.playerBalance(accounts[2]);
        let account3BalanceBeforeWithdraw = await instance.playerBalance(accounts[3]);
        let account4BalanceBeforeWithdraw = await instance.playerBalance(accounts[4]);

        let expectedPlayerBalance;
        let expectedContractBalance;
        if(result == 1) {
            expectedPlayerBalance = (parseFloat(totalBetAmountBeforeFlip) - (parseFloat(totalBetAmountBeforeFlip) * 0.1)) / 1;
            assert(account2BalanceBeforeWithdraw == 0 && account3BalanceBeforeWithdraw == 0 && account4BalanceBeforeWithdraw == expectedPlayerBalance, 
                "account balances before withdraw are not correct " + account4BalanceBeforeWithdraw + "   " + expectedPlayerBalance);
                await instance.withdrawAllUserBalance({from: accounts[4]});
                expectedContractBalance = parseFloat(contractBeforeWithdraw) - parseFloat(account4BalanceBeforeWithdraw);
        }
        else {
            expectedPlayerBalance = (parseFloat(totalBetAmountBeforeFlip) - (parseFloat(totalBetAmountBeforeFlip) * 0.1)) / 2;
            assert(account2BalanceBeforeWithdraw == expectedPlayerBalance && account3BalanceBeforeWithdraw == expectedPlayerBalance && account4BalanceBeforeWithdraw == 0, 
                "account balances before withdraw are not correct " + account4BalanceBeforeWithdraw + "   " + expectedPlayerBalance);
                await instance.withdrawAllUserBalance({from: accounts[2]});
                await instance.withdrawAllUserBalance({from: accounts[3]});
                expectedContractBalance = parseFloat(contractBeforeWithdraw) - (parseFloat(account2BalanceBeforeWithdraw) + parseFloat(account2BalanceBeforeWithdraw));
        }

        let account2BalanceAfterWithdraw = await instance.playerBalance(accounts[2]);
        let account3BalanceAfterWithdraw = await instance.playerBalance(accounts[3]);
        let account4BalanceAfterWithdraw = await instance.playerBalance(accounts[4]);
        let contractBalanceAfterWithdraw = await instance.getContractBalance();

        assert(account2BalanceAfterWithdraw == 0 && account3BalanceAfterWithdraw == 0 && account4BalanceAfterWithdraw == 0, "Accounts balances after withdraw are not matching")
        assert(contractBalanceAfterWithdraw == expectedContractBalance, "Contract balance should be " + expectedContractBalance + " But was " + contractBalanceAfterWithdraw);
    });

    it("Should be error if sender has no balance", async function(){
        await truffleAssert.fails(instance.withdrawAllUserBalance({from: accounts[4]}), truffleAssert.ErrorType.REVERT);
    });

    // web3.eth.getGasPrice(function(error, result){ 
    //     var gasPrice = Number(result);
    //     console.log("Gas Price is " + gasPrice + " wei"); // "10000000000000"
    //     TestContract.deployed().then(function(instance) {
    
    //         // Use the keyword 'estimateGas' after the function name to get the gas estimation for this particular function 
    //         return instance.giveAwayDividend.estimateGas(1);
    
    //     }).then(function(result) {
    //         var gas = Number(result);
    
    //         console.log("gas estimation = " + gas + " units");
    //         console.log("gas cost estimation = " + (gas * gasPrice) + " wei");
    //         console.log("gas cost estimation = " + TestContract.web3.fromWei((gas * gasPrice), 'ether') + " ether");
    //     });
    // });
});
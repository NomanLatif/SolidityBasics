var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var contractAddress = "0x40586a10dc0E73dedfD319034c215984d836181D";
// var betTakenEvent;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
        contractInstance = new web3.eth.Contract(abi, contractAddress, {from: accounts[0]});
        console.log(contractInstance);
        betTakenWatch();
        // betTakeEvent = contractInstance.betTaken();
        totalBetAmount();
        getAccounts(function(result) {
            userBalance(result[0]);
        });
    });

    // web3.eth.getBalance(contractAddress).then(function(result){
    //     $("#jackpot_output").text(web3.utils.fromWei(result, "ether") + " Ether");
    // });

    $("#bet_on_head_button").bind("click", function(event) {
        bet("0");
    });
    $("#bet_on_tail_button").bind("click", function(event) {
        bet("1");
    });
    $("#flip_button").click(flip);
    $("#fund_contract_button").click(fundContract);
    $("#withdraw_button").click(withdrawAll);
});

async function bet(choice) {
    var betAmount = await contractInstance.methods.bettingAmount().call();
    var config = {
        value: web3.utils.toWei(betAmount,"wei")
    }
    contractInstance.methods.bet(choice).send(config)
    .on("transactionHash", function(hash){
        console.log(hash);
    })
    .on("confirmation", function(confirmationNr){
        console.log(confirmationNr);
    })
    .on("receipt", function(receipt){
        console.log(receipt);
        /*
        if(receipt.events.betTaken.returnValues[2] === false){
            alert("You lost " + bet + " Ether!");
        }
        else if(receipt.events.betTaken.returnValues[2] === true){
            alert("You won " + bet + " Ether!");
        }
        */
    })
}

function flip(){
    //var bet = $("#bet_input").val();
    // var config = {
    //     value: web3.utils.toWei(bet,"ether")
    // }
    contractInstance.methods.flip().send()
    .on("transactionHash", function(hash){
        console.log(hash);
    })
    .on("confirmation", function(confirmationNr){
        console.log(confirmationNr);
    })
    .on("receipt", function(receipt){
        console.log(receipt);
        /*
        if(receipt.events.betTaken.returnValues[2] === false){
            alert("You lost " + bet + " Ether!");
        }
        else if(receipt.events.betTaken.returnValues[2] === true){
            alert("You won " + bet + " Ether!");
        }
        */
    })

}


function fundContract(){
    var fund = $("#fund_input").val();
    var config = {
        value: web3.utils.toWei(fund,"ether")
    }
    contractInstance.methods.fundContract().send(config)
    .on("transactionHash", function(hash){
        console.log(hash);
    })
    .on("confirmation", function(confirmationNr){
        console.log(confirmationNr);
    })
    .on("receipt", function(receipt){
        console.log(receipt);
    })
}

function withdrawAll(){
    contractInstance.methods.withdrawAll().send();
}

async function userBalance(account) {
    var userBalance = await contractInstance.methods.playerBalance(account).call();
    $("#user_balance_label").text(web3.utils.fromWei(userBalance, "ether") + " Ether");
}

async function totalBetAmount() {
    var totalBetAmount = await contractInstance.methods.totalBetAmount().call();
    updateTotalBetAmount(totalBetAmount);
}

function getAccounts(callback) {
    web3.eth.getAccounts((error,result) => {
        if (error) {
            console.log(error);
        } else {
            callback(result);
        }
    });
}

function betTakenWatch() {
    contractInstance.events.betTaken(function(error, event){ 
        console.log(event); 
    })
    .on('data', function(event){
        updateTotalBetAmount(event.returnValues.totalBetAmount);
        updatePlayers();
    })
    .on('changed', function(event){
        // remove event from local database
        console.log("changed event")
    })
    .on('error', console.error);
}

function updateTotalBetAmount(totalBetAmount) {
    $("#total_bet_amount_label").text(web3.utils.fromWei(totalBetAmount, "ether")  + " Ether");
}

async function updatePlayers(){
    var players = await contractInstance.getPlayers();
    console.log("All players " + JSON.stringify(players));
}
// betTaken.watch(function(error, result){
//     if (!error)
//         {
//             console.log("event received " + JSON.stringify(result));
//         } else {
//             console.log("event error " + JSON.stringify(error));
//         }
// });
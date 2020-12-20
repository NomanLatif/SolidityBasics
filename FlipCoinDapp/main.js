var web3 = new Web3(Web3.givenProvider);
var contractInstance;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
        contractInstance = new web3.eth.Contract(abi, "0x8A5c7D96EFDf40292d4fEB6E7d1BA5ddc41373C0", {from: accounts[0]});
        console.log(contractInstance);
    });

    web3.eth.getBalance("0x8A5c7D96EFDf40292d4fEB6E7d1BA5ddc41373C0").then(function(result){
        $("#jackpot_output").text(web3.utils.fromWei(result, "ether") + " Ether");
    });

    $("#flip_button").click(flip);
    $("#fund_contract_button").click(fundContract);
    $("#withdraw_button").click(withdrawAll);
});

function flip(){
    var bet = $("#bet_input").val();
    var config = {
        value: web3.utils.toWei(bet,"ether")
    }
    contractInstance.methods.flip().send(config)
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

    contractInstance.events.betTaken(function(error, event){ 
        console.log(event); 
    })
    .on('data', function(event){
        console.log(event); // same results as the optional callback above
    })
    .on('changed', function(event){
        // remove event from local database
    })
    .on('error', console.error);

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
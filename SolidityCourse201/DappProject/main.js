var web3 = new Web3(Web3.givenProvider);
var contractInstance;

$(document).ready(function( ) {
    window.ethereum.enable().then(function(accounts){
        contractInstance = new web3.eth.Contract(abi, "0xfDB5bC6D89eE5D4F79ABD603EcC1a32225e1FdFa", {from: accounts[0]});
        console.log(contractInstance);
    });
});

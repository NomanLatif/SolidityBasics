const FlipCoinContract = artifacts.require("FlipCoinContract");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(FlipCoinContract).then(function(instance){
    instance.fundContract({value: web3.utils.toWei("0.5","ether"), from: accounts[0]}).then(function(){
      console.log("The contract successfully got funded with 0.5 ether by the contract owner " + accounts[0]);
      console.log("The contract address is " + FlipCoinContract.address);
      instance.setBettingAmount(web3.utils.toWei("0.1", "ether")).then(function(){
        console.log("Beting amount is set to 0.1 ether");
      }).catch(function(err){
        console.log("error: "+ err);
      });
    }).catch(function(err){
      console.log("error: " + err);
    });
  }).catch(function(err){
    console.log("Fail to deploy " + err);
  });
};

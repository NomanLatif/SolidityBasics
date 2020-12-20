const FlipContract = artifacts.require("FlipContract");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(FlipContract).then(function(instance){
    instance.fundContract({value: web3.utils.toWei("0.5","ether"), from: accounts[0]}).then(function(){
      console.log("The contract successfully got funded with 0.5 ether by the contract owner " + accounts[0]);
      console.log("The contract address is " + FlipContract.address);
    }).catch(function(err){
      console.log("error: " + err);
    });
  }).catch(function(err){
    console.log("Fail to deploy " + err);
  });
};

const Helloworld = artifacts.require("Helloworld");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Helloworld).then(function(instance){
    instance.setMessage("Hello again!", {value: 100000, from: accounts[0]}).then(function(){
      console.log("Message is set");
    }).catch(function(err){
      console.log("Error:" + err);
    });
  }).catch(function(err){
    console.log("Deployment failed " + err);
  });
};

var web3 = new Web3(Web3.givenProvider);
var contractInstance;

$(document).ready(function( ) {
    window.ethereum.enable().then(function(accounts){
        contractInstance = new web3.eth.Contract(abi, "0xfDB5bC6D89eE5D4F79ABD603EcC1a32225e1FdFa", {from: accounts[0]});
    });
    $("#get_data_button").click(fetchAndDisplay);
    $("#add_data_button").click(inputData);
});

function inputData(){
    var name = $("#name_input").val();
    var age = $("#age_input").val();
    var height = $("#height_input").val();
    contractInstance.methods.createPerson(name, age, height).send({value: web3.utils.toWei("1", "ether")})
      .on('transactionHash', function(hash){
        console.log("tx hash");
      })
      .on('confirmation', function(confirmationNumber, receipt){
          console.log("conf");
      })
      .on('receipt', function(receipt){
        console.log(receipt);
      })
    }
  function fetchAndDisplay(){
    contractInstance.methods.getPerson().call().then(function(res){
      displayInfo(res);
    });
  }
  function displayInfo(res){
  
    $("#name_output").text(res["name"]);
    $("#age_output").text(res["age"]);
    $("#height_output").text(res["height"]);
  }

const Helloworld = artifacts.require("Helloworld");

contract("Helloworld", async function(){
  it("should initialize correctly", async function(){
    let instance = await Helloworld.deployed();
    let message = await instance.getMessage();
    assert(message === "Hello Again!"
    , "Message should be Hello Again!");
  });

  it("should set the message correclty", async function(){
    let instance = await Helloworld.deployed();
    let newMessage = "Testing Message";
    await instance.setMessage(newMessage);
    let message = await instance.getMessage();
    assert(message === newMessage
    , "Message should be " + newMessage + " But it was " + message);
  });
});
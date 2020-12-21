pragma solidity 0.5.12;

import "./Ownable.sol";

contract FlipCoinContract is Ownable {
    uint public bettingAmount;
    bool public pauseBettingAfterCurrentRound;
    bool public isContractPaused;

    event funded(address contractOwner, uint funding);

    constructor() public {
        
    }

    modifier costs(uint cost){
        require(msg.value >= cost);
        _;
    }

    modifier contactNotPaused(){
        require(isContractPaused == false);
        _;
    }

    function setBettingAmount(uint amount) public onlyContractOwner {
        bettingAmount = amount;
    }

    function withdrawAll() public onlyContractOwner returns(uint){
        msg.sender.transfer(address(this).balance);
        assert(address(this).balance == 0);
        return address(this).balance;
    }

    function withdraw(uint amountToWithdraw) public onlyContractOwner returns(uint){
        emit funded(msg.sender, address(this).balance);
        require(amountToWithdraw <= address(this).balance, "Contract does not have enough amount");
        msg.sender.transfer(amountToWithdraw);
        return address(this).balance;
    }

    function getContractBalance() public view returns (uint) {
        uint contractBalance;
        return contractBalance = address(this).balance;
    }

    function fundContract() public payable returns(uint){
        require(msg.value != 0);
        emit funded(msg.sender, msg.value);
        return msg.value;
    }

    function pauseBetting(bool pauseTheBetting) public onlyContractOwner {
        pauseBettingAfterCurrentRound = pauseTheBetting;
    }

    function pauseContract(bool pauseTheContract) public onlyContractOwner {
        isContractPaused = pauseTheContract;
    }

    function destroy() public onlyContractOwner {
        address payable receiver = msg.sender;
        selfdestruct(receiver);
    }
}
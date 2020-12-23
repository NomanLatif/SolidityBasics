pragma solidity 0.5.12;

import "./Ownable.sol";
import "./SafeMath.sol";

contract FlipCoinContract is Ownable {
    enum BetingChoice{HEAD, TAIL}

    uint public bettingAmount;
    bool public pauseBettingAfterCurrentRound;
    bool public isContractPaused;
    uint public totalBetAmount;
    address[] public playersForHead;
    address[] public playersForTail;
    mapping (address => uint) public playerBalance;

    event funded(address contractOwner, uint funding);
    event betTaken(address player, uint betAmount, BetingChoice choice);

    constructor() public {
        
    }

    modifier costs(uint cost){
        require(msg.value == cost);
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

    function withdraw(uint amountToWithdraw) public onlyContractOwner {
        require(amountToWithdraw <= address(this).balance, "Contract does not have enough amount");
        msg.sender.transfer(amountToWithdraw);
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

    function bet(BetingChoice choice) public payable costs(bettingAmount) {
        totalBetAmount = SafeMath.add(totalBetAmount, msg.value);
        choice == BetingChoice.HEAD ? playersForHead.push(msg.sender) : playersForTail.push(msg.sender);

        emit betTaken(msg.sender, msg.value, choice);
    }

    function flip() public onlyContractOwner {
        uint8 winner = 1; // get random 0 or 1
        uint commision = SafeMath.div(totalBetAmount, 10);
        uint amountToDistribute = SafeMath.sub(totalBetAmount, commision); // subtract commision

        address[] memory winners = winner == 0 ? playersForHead : playersForTail;
        uint shareAmount = SafeMath.div(amountToDistribute, winners.length);
        totalBetAmount = 0;
        for(uint i = 0; i < winners.length; i++) {
            playerBalance[winners[i]] = SafeMath.add(playerBalance[winners[i]], shareAmount);
        }
        delete playersForHead;
        delete playersForTail;
    }

    function getNumberOfHeadBets() public view returns(uint) {
        return playersForHead.length;
    }

    function getNumberOfTailBets() public view returns(uint) {
        return playersForTail.length;
    }
}
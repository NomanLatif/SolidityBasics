pragma solidity 0.5.12;

import "./Ownable.sol";
import "./SafeMath.sol";

contract FlipCoinContract is Ownable {
    enum BetingChoice{HEAD, TAIL}

    struct BetDetails{
        BetingChoice choice;
        uint betAmount;
    }

    uint public bettingAmount;
    bool public pauseBettingAfterCurrentRound;
    bool public isContractPaused;
    uint[2] public betBalance;

    mapping (address => BetDetails) private bets;

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
        BetDetails memory betDetails;
        betDetails.betAmount = msg.value;
        betDetails.choice = choice;
        address player = msg.sender;
        bets[player] = betDetails;

        betBalance[uint(choice)] = SafeMath.add(betBalance[uint(choice)], msg.value);

        emit betTaken(msg.sender, msg.value, choice);
    }

    function getBetDetails(address player) public view returns(uint, uint) {
        return (uint(bets[player].choice), bets[player].betAmount);
    }

    function flip() public onlyContractOwner {

    }
}
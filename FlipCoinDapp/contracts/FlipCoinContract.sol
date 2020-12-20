import"./Ownable.sol";
pragma solidity 0.5.12;

contract FlipCoinContract is Ownable {
    uint public bettingAmount;
    event funded(address contractOwner, uint funding);

    constructor() public {
        
    }

    modifier costs(uint cost){
        require(msg.value >= cost);
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

    function getContractBalance() public view returns (uint) {
        uint contractBalance;
        return contractBalance = address(this).balance;
    }

    function fundContract() public payable returns(uint){
        require(msg.value != 0);
        emit funded(msg.sender, msg.value);
        return msg.value;
    }
}
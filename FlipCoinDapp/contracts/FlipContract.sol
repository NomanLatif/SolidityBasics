import"./Ownable.sol";
//import"./provableAPI.sol";

pragma solidity 0.5.12;

contract FlipContract is Ownable {

    uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;    //Value of 1-32: But why unit256? Isn't uint8 enought? In ProvableAPI.sol in line 1077 there is even a conversion to uint8 >> byte(uint8(_nbytes));
    bytes32 queryId;                                    //Is it realy necessary to have it as state variable?

    struct Bet {                                        //Struct Variable for betting process
        address payable player;                         //msg.sender is the player
        uint value;                                     //betting value (double or loose)
        bool result;                                    //win or loose result
    }
//* Events */
    event betTaken(address player, uint value, bool result);
    event funded(address contractOwner, uint funding);
    event LogNewProvableQuery(string description);
    event generatedRandomNumber(uint256 randomNumber);

    mapping (bytes32 => Bet) public betting;            //Query Id coupling to Bet
    mapping (address => bool) public waiting;           //Msg.sender waiting system (Player have to wait until previous bet is taken and finished)

    constructor() public {
        //provable_setProof(proofType_Ledger);
        //flip();
    }

    modifier costs(uint cost){
        uint jackpot = address(this).balance / 2;
        require(msg.value <= jackpot, "Jackpot is the max bet you can make");   //This statement is not working yet
        require(msg.value >= cost, "The minimum bet you can make is 0.01 Ether");
        _;
    }
    // Oracle Callback Function of the flip() function
    function __callback(bytes32 _queryId, string memory _result, bytes memory _proof) public {
        //require(msg.sender == provable_cbAddress());

        // if (provable_randomDS_proofVerify__returnCode(_queryId, _result, _proof) != 0) {
        //     /*
        //      * @notice  The proof verification has failed! Handle this case
        //      *          however you see fit. --> Not sure what to do here.
        //     */
        // }
        // else {

        uint256 randomNumber = uint256(keccak256(abi.encodePacked(_result))) % 2;

        if(randomNumber == 0){
            betting[_queryId].result == false;
        }
        else if(randomNumber == 1){
            betting[_queryId].result == true;
            betting[_queryId].player.transfer((betting[_queryId].value)*2);
        }

        waiting[betting[_queryId].player] = false;

        emit betTaken(betting[_queryId].player, betting[_queryId].value, betting[_queryId].result);
        emit generatedRandomNumber(randomNumber);
    //    }
    }
    // Function to simulate coin flip 50/50 randomnes
    function flip() public payable costs(0.01 ether){
        bytes32 queryId = testRandom();
        // require(waiting[msg.sender] == false);
        // waiting[msg.sender] = true;

        // uint256 QUERY_EXECUTION_DELAY = 0;      //config: execution delay (0 for no delay)
        // uint256 GAS_FOR_CALLBACK = 200000;      //config: gas fee for calling __callback function (200000 is standard)
        // queryId = provable_newRandomDSQuery(QUERY_EXECUTION_DELAY, NUM_RANDOM_BYTES_REQUESTED, GAS_FOR_CALLBACK);     //function to query a random number, it will call the __callback function

        // betting[queryId] = Bet({player: msg.sender, value: msg.value, result: false});      //Initialize Bet with values of player

        emit LogNewProvableQuery("Provable query was sent, standing by for answer...");
    }

    function testRandom() public returns(bytes32){
        bytes32 queryId = bytes32(keccak256("test"));
        __callback(queryId, "1", bytes("test"));
        return queryId;
    }
    // Function to Withdraw Funds
    function withdrawAll() public onlyContractOwner returns(uint){
        //Should require that no bet is prozess! Should wait!
        msg.sender.transfer(address(this).balance);
        assert(address(this).balance == 0);
        return address(this).balance;
    }
    // Function to get the Balance of the Contract
    function getContractBalance() public view returns (uint) {
        uint contractBalance;
        return contractBalance = address(this).balance;
    }
    // Fund the Contract
    function fundContract() public payable onlyContractOwner returns(uint){
        require(msg.value != 0);
        //ContractBalance += msg.value;
        emit funded(msg.sender, msg.value);
        //assert(ContractBalance == address(this).balance);
        return msg.value;
    }

}
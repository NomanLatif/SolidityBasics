# Flip DApp

This litte DApp project was created as part of an ethereum smart contract programming course. This repository is made for education purposes.
Thanks to Ivan & Filip for the great education on https://academy.ivanontech.com/

## Development Setup & Documentation 

### Requirements
1. Install Truffle: https://www.trufflesuite.com/docs/truffle/getting-started/installation
    ```
    npm install -g truffle
    ```
2. Install Ganache: https://www.trufflesuite.com/docs/ganache/quickstart

### Additional installations 
For unit testing truffle-assertions can be very helpful
1. Initialize node package manager fist
    ```
    npm init
    ```
2. Install truffle-assertions
    ```
    npm install truffle-assertions
    ```

### Build Smart Contract
1. Initializing a new Truffle project
    ```
    truffle init
    ```
2. Create a new solidity contract "FlipContract.sol" + "Ownable.sol"

3. Create a new migration file "2_FlipContract_migration.js"

4. Creat a new Unit Testing file "FlipContractUnitTest.js"

5. Changing the compiler version in the "truffle-config.js" file

6. Test, improve, develop....

### Smart Contract to DApp
#### Requirements
1. Install python

2. MeteMask Brower extension

#### Localhost Ganche Setup
1. Implement Basic DApp Template "index.html", "main.js" & "web2.min.js"

2. Run a local python web server with console
    ```
    python -m http.server
    ```
3. Have a look in the browser
    > localhost:8000

4. Adjust "index.html" file

5. Add Ganache RPC Network to MetaMask "http://127.0.0.1:7545"

6. Import Private Ganache Key to MetaMask

7. Define JavaScript instance in "main.js" and create "abi.js" file

8. Import "abi.js" to index.html line 12

#### Testnet Ropsten Setup
1. Uncomment lines 21-25 & 63 - 70 (Ropsten Network Configuration ) of "truffle-config.js" file

2. Register on infura.io
    * create new project
    * copy "Project Secret" => Past to infuraKey in line 22 in truffle-config.js file
    * copy "Endpoint Ropsten" => Past to provider link in line 64

3. Receal and Copy Seed Words of MetaMask Wallet
    * create new file ".secret" => past in the Seed Words

4. Install node package
    ```
    npm install truffle-hdwallet-provider
    ```
5. Get some Test-Ether for the Ropsten Network
    * go to https://faucet.metamask.io/ and request 1 Ether from faucet

6. Deploy contract on Ropsten Network
    ```
    truffle migrate --network ropsten 
    ```
#### Get Provable API

1. Download and save provableAPI.sol file form https://github.com/provable-things/ethereum-api/blob/master/provableAPI_0.5.sol
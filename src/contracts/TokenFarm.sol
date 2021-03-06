pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";
    address public owner;

    DappToken public dappToken;
    DaiToken public daiToken;

    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping (address => bool) public isStaking;
    
    address[] public stakers;

    constructor (DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    //1. Stakes Tokens
    function stakeTokens(uint _amount) public {

        require(_amount > 0, "amount cannot be 0");

        daiToken.transferFrom(msg.sender, address(this), _amount);

        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;


    }

    //2. Unstaking Tokens
    function unstakeTokens() public {

        uint balance = stakingBalance[msg.sender];

        require(balance > 0, "amount cannt be 0");

        daiToken.transfer(msg.sender, balance);
        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
        
    }

    //3. Issuing Tokens
    function issueTokens() public {

        require(msg.sender == owner, "caller must be owner");

        for(uint i=0; i<stakers.length; i++) {

            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];

            if(balance > 0 && isStaking[recipient]) {
                dappToken.transfer(recipient, balance);

            }
        }
    }
     
}

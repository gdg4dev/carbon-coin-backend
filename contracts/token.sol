// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/access/Ownable.sol";

contract CarbonCreditScore is ERC20, Ownable {

    // Struct to hold user habits data
    struct UserHabit {
        string transportationMode;
        uint256 carbonSaved; // in grams
        uint128 miles;
        string  timestamp;
        uint256 currentTokens; // gives the current $CRBT count w/ addition to carbonSaved
        bool exists; // ticker for existence
    }

    // Mapping from user address to their habits data
    mapping(address => UserHabit[]) public userHabits;

    constructor() ERC20("CarbonKarma", "CRBT") {
    }

    // Function to allow users to add their own carbon saving activities
    function addUserHabit(string memory transportationMode, uint256 carbonSaved, uint128 miles, string memory timestamp) public {
        _mint(msg.sender, carbonSaved); // Adjust the amount based on actual calculation of carbon saved

        uint256 currentTokens = 0;
        if (userHabits[msg.sender].length > 0 && userHabits[msg.sender][userHabits[msg.sender].length - 1].exists) {
            currentTokens = userHabits[msg.sender][userHabits[msg.sender].length - 1].currentTokens;
        }

        // Record the user's habit
        userHabits[msg.sender].push(UserHabit({
            transportationMode: transportationMode,
            carbonSaved: carbonSaved,
            miles: miles,
            timestamp: timestamp,
            currentTokens: currentTokens,
            exists: true
        }));
    }


    // Function to get user habits
    function getUserHabits(address user) public view returns (UserHabit[] memory) {
        return userHabits[user];
    }

}
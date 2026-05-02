// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {StuffERC721} from "@stuff/StuffERC721.sol";

/**
 * @dev Factory for StuffERC721 collections.
 */
contract StuffFactory {
    /**
     * @dev Variables.
     */
    uint256 public stuffIdsIndex = 0;

    /**
     * @dev Mappings.
     */
    mapping(uint256 => StuffERC721) public stuffs;

    /**
     * @dev Events.
     */
    event StuffERC721Created(uint256 indexed stuffId, address indexed stuffERC721);

    /**
     * @dev
     */
    function createStuffERC721(StuffERC721.StuffCollection calldata _stuffCollection, address _owner, address _relayer)
        external
        returns (StuffERC721 stuff)
    {
        uint256 stuffId = stuffIdsIndex++;

        stuff =
            new StuffERC721({_stuffId: stuffId, _stuffCollection: _stuffCollection, _owner: _owner, _relayer: _relayer});

        stuffs[stuffId] = stuff;

        emit StuffERC721Created(stuffId, address(stuff));
    }
}

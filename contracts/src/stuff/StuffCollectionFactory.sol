// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {PantoneRegistry} from "@stuff/PantoneRegistry.sol";
import {StuffCollectionERC721} from "@stuff/StuffCollectionERC721.sol";

/**
 * @dev Factory for StuffCollectionERC721.
 */
contract StuffCollectionFactory {
    /**
     * @dev Variables.
     */
    uint256 public stuffIdsIndex = 0;
    PantoneRegistry public immutable PANTONE_REGISTRY;

    /**
     * @dev Mappings.
     */
    mapping(uint256 => StuffCollectionERC721) public stuffCollection;

    /**
     * @dev Events.
     */
    event StuffCollectionERC721Created(
        //
        uint256 indexed stuffId,
        address indexed stuffERC721,
        StuffCollectionERC721.StuffCollection stuffCollection
    );

    error InvalidPantoneRegistry();

    constructor(PantoneRegistry _pantoneRegistry) {
        if (address(_pantoneRegistry) == address(0)) revert InvalidPantoneRegistry();

        PANTONE_REGISTRY = _pantoneRegistry;
    }

    /**
     * @dev
     */
    function createStuffCollectionERC721(
        StuffCollectionERC721.StuffCollection calldata _stuffCollection,
        address _owner,
        address _relayer
    ) external returns (StuffCollectionERC721 newStuffCollection) {
        uint256 stuffId = stuffIdsIndex++;

        newStuffCollection = new StuffCollectionERC721({
            _stuffId: stuffId,
            _stuffCollection: _stuffCollection,
            _pantoneRegistry: PANTONE_REGISTRY,
            _owner: _owner,
            _relayer: _relayer
        });

        stuffCollection[stuffId] = newStuffCollection;

        emit StuffCollectionERC721Created(stuffId, address(newStuffCollection), _stuffCollection);
    }
}

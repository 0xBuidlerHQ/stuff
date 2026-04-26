// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console2.sol";

abstract contract Packages is Script {
    string constant DEPLOYMENTS_PATH = "./deployments/deployments.json";

    function addDeployment(string memory contractName, address deployed) internal {
        _ensureDeploymentsFile();

        // chainId key as string: "1", "8453", "31337", ...
        string memory chainKey = vm.toString(block.chainid);

        // JSONPath like: .StuffERC721.1
        string memory jsonPath = string.concat(".", contractName, ".", chainKey);

        // value must be valid JSON. For a string => wrap in quotes.
        string memory valueJson = string.concat('"', vm.toString(deployed), '"');

        // This updates ONLY that path, preserving the rest of deployments.json
        vm.writeJson(valueJson, DEPLOYMENTS_PATH, jsonPath);
    }

    function _ensureDeploymentsFile() internal {
        if (!vm.exists(DEPLOYMENTS_PATH)) {
            vm.writeFile(DEPLOYMENTS_PATH, "{}");
        }
    }
}

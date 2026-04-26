// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console2.sol";

abstract contract Actors is Script {
    struct Actor {
        string name;
        uint32 index; // HD index: 0,1,2...
        uint256 pk; // private key (derived)
        address addr; // EOA
    }

    // Override if you want a different env var name
    function mnemonicEnvKey() internal pure virtual returns (string memory) {
        return "ENV_ANVIL_MNEMONIC";
    }

    // Foundry provides deriveKey(mnemonic, index) => m/44'/60'/0'/0/<index>
    function actor(string memory name, uint32 index) internal view returns (Actor memory a) {
        string memory m = vm.envString(mnemonicEnvKey());
        uint256 pk = vm.deriveKey(m, index);
        a = Actor({name: name, index: index, pk: pk, addr: vm.addr(pk)});
    }

    /// Convenience: log an actor
    function logActor(Actor memory a) internal pure {
        console2.log(string.concat(a.name, " (index ", vm.toString(a.index), "): "), a.addr);
    }

    /// Start broadcasting as this actor
    function start(Actor memory a) internal {
        console2.log(string.concat("=> broadcasting as ", a.name, " "), a.addr);
        vm.startBroadcast(a.pk);
    }

    function stop() internal {
        vm.stopBroadcast();
    }

    /// Pattern helper: run a block as an actor (manual “scoping”)
    function withBroadcast(Actor memory a) internal {
        start(a);
    }
}

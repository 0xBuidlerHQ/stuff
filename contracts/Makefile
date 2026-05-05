-include .env
export

### -------------------------
### Variables
### -------------------------
LOCAL_RPC = http://127.0.0.1:8545

ALCHEMY_BASE_RPC = ${ENV_ALCHEMY_BASE_RPC}
ANVIL_MNEMONIC = ${ENV_ANVIL_MNEMONIC}
ANVIL_CHAIN_ID = 31337

SCRIPT_DEPLOY = script/Deploy.s.sol:Deploy


### -------------------------
### Local chain
### -------------------------

ANVIL_DEV_FLAGS=--fork-url $(ALCHEMY_BASE_RPC) --mnemonic $(ANVIL_MNEMONIC) --chain-id ${ANVIL_CHAIN_ID}
.PHONY: dev
dev:
	anvil $(ANVIL_DEV_FLAGS)

.PHONY: clean
clean:
	forge clean

.PHONY: build
build: 
	forge build

FORGE_DEPLOY_FLAGS=--rpc-url $(LOCAL_RPC) --broadcast
.PHONY: deploy
deploy:
	forge script $(SCRIPT_DEPLOY) $(FORGE_DEPLOY_FLAGS)

import { stuffErc721Config, stuffFactoryConfig } from "@0xhq/stuff.contracts";
import type { StuffERC721 } from "@0xhq/stuff.contracts/types.user";
import { cache } from "react";
import type { Address } from "viem";
import { multicall, readContract } from "wagmi/actions";
import { getStuffAssets } from "@/assets";
import type { Stuff } from "@/features/stuff/type";
import { wagmiConfig } from "@/providers/wagmi.config";

type GetStuffsOptions = {
	chainId: keyof typeof stuffFactoryConfig.address;
};

/**
 * @dev getStuffs.
 */
const getStuffs = cache(async (options: GetStuffsOptions) => {
	const config = wagmiConfig();

	const stuffFactoryAddress = stuffFactoryConfig.address[options.chainId];
	const stuffFactoryABI = stuffFactoryConfig.abi;
	const stuffERC721ABI = stuffErc721Config.abi;

	const stuffIdsIndex = await readContract(config, {
		abi: stuffFactoryABI,
		functionName: "stuffIdsIndex",
		address: stuffFactoryAddress,
	});

	const stuffIds = Array.from({ length: Number(stuffIdsIndex) }, (_, index) => BigInt(index));
	const stuffAddresses = (await multicall(config, {
		allowFailure: false,
		contracts: stuffIds.map((stuffId) => ({
			abi: stuffFactoryABI,
			functionName: "stuffs",
			args: [stuffId] as const,
			address: stuffFactoryAddress,
		})),
	})) as unknown as Address[];

	const stuffBlueprints = (await multicall(config, {
		allowFailure: false,
		contracts: stuffAddresses.map((stuffAddress) => ({
			abi: stuffERC721ABI,
			functionName: "getStuffBlueprint",
			address: stuffAddress,
		})),
	})) as StuffERC721.StuffCollection[];

	return stuffIds.map((id, index) => {
		const address = stuffAddresses[index];
		const blueprint = stuffBlueprints[index];

		const assets = getStuffAssets(blueprint.sku);

		return {
			slug: blueprint.sku,
			//
			id,
			assets,
			blueprint,
			address,
		};
	}) as Stuff[];
});

export { getStuffs };

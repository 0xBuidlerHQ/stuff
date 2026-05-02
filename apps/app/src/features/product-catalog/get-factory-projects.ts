import { stuffErc721Config, stuffFactoryConfig } from "@0xhq/stuff.contracts";
import type { StuffERC721 } from "@0xhq/stuff.contracts/types.user";
import { cache } from "react";
import type { Address } from "viem";
import { readContract } from "wagmi/actions";
import { getProductAssets, type ProductAssets } from "@/assets";
import { wagmiConfig } from "@/providers/wagmi.config";
import { getStuffCollection } from "./get-stuff-collection";

type FactoryProject = {
	stuffId: bigint;
	stuffAddress: Address;
	collection: StuffERC721.StuffCollection;
	currentSupply: bigint;
	assets: ProductAssets;
	slug: string;
};

const getFactoryProjects = cache(async () => {
	const stuffIdsIndex = await readContract(wagmiConfig(), {
		abi: stuffFactoryConfig.abi,
		functionName: "stuffIdsIndex",
		address: stuffFactoryConfig.address["31337"],
	});

	const stuffIds = Array.from({ length: Number(stuffIdsIndex) }, (_, index) => BigInt(index));

	return (await Promise.all(
		stuffIds.map(async (stuffId) => {
			const stuffAddress = (await readContract(wagmiConfig(), {
				abi: stuffFactoryConfig.abi,
				functionName: "stuffs",
				args: [stuffId],
				address: stuffFactoryConfig.address["31337"],
			})) as Address;

			const [collection, currentSupply] = await Promise.all([
				getStuffCollection(stuffAddress),
				readContract(wagmiConfig(), {
					abi: stuffErc721Config.abi,
					functionName: "tokenIdsIndex",
					address: stuffAddress,
				}) as Promise<bigint>,
			]);
			const assets = getProductAssets(collection.sku);

			return {
				assets,
				collection,
				currentSupply,
				slug: collection.sku,
				stuffAddress,
				stuffId,
			};
		}),
	)) as FactoryProject[];
});

export type { FactoryProject };
export { getFactoryProjects };

import type { StuffERC721 } from "@0xhq/stuff.contracts/types.user";
import type { Address } from "viem";
import type { ProductAssets } from "@/assets";

type Stuff = {
	slug: string;
	id: bigint;
	address: Address;
	blueprint: StuffERC721.StuffBlueprint;
	assets: ProductAssets;
};

export type { Stuff };

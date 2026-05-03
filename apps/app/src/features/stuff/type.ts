import type { StuffERC721 } from "@0xhq/stuff.contracts/types.user";
import type { Address } from "viem";
import type { StuffAssets } from "@/assets";

type Stuff = {
	id: bigint;
	slug: string;
	address: Address;
	blueprint: StuffERC721.StuffCollection;
	assets: StuffAssets;
};

export type { Stuff };

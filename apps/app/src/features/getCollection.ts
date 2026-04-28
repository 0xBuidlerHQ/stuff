import { stuffErc721Config } from "@0xhq/stuff.contracts";
import type { StuffERC721 } from "@0xhq/stuff.contracts/types.user";
import { cache } from "react";
import type { Address } from "viem";
import { readContract } from "wagmi/actions";
import { wagmiConfig } from "@/providers/wagmi.config";

export const getStuffCollection = cache(async (stuffAddress: Address) => {
	return readContract(wagmiConfig(), {
		abi: stuffErc721Config.abi,
		functionName: "getCollection",
		address: stuffAddress,
	}) as unknown as StuffERC721.StuffCollection;
});

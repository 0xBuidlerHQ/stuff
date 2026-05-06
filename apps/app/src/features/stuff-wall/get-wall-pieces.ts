import { stuffErc721Config } from "@0xhq/stuff.contracts";
import { cache } from "react";
import type { Address } from "viem";
import { readContract } from "wagmi/actions";
import { decodeCanvasToPixels } from "@/features/grid";
import type { Stuff, StuffMinted, WallPiece } from "@/features/stuff/types";
import { wagmiConfig } from "@/providers/wagmi.config";

const getWallPieces = cache(async (collection: Stuff): Promise<WallPiece[]> => {
	try {
		const tokenIdsIndex = (await readContract(wagmiConfig(), {
			abi: stuffErc721Config.abi,
			functionName: "tokenIdsIndex",
			address: collection.address,
		})) as bigint;

		const tokenIds = Array.from({ length: Number(tokenIdsIndex) }, (_, index) => BigInt(index));
		const pieces = await Promise.all(
			tokenIds.map(async (index) => {
				const tokenId = (await readContract(wagmiConfig(), {
					abi: stuffErc721Config.abi,
					functionName: "tokenByIndex",
					args: [index],
					address: collection.address,
				})) as bigint;

				const [owner, stuff] = (await Promise.all([
					readContract(wagmiConfig(), {
						abi: stuffErc721Config.abi,
						functionName: "ownerOf",
						args: [tokenId],
						address: collection.address,
					}),
					readContract(wagmiConfig(), {
						abi: stuffErc721Config.abi,
						functionName: "getStuffItem",
						args: [tokenId],
						address: collection.address,
					}),
				])) as [Address, StuffMinted];

				return {
					owner,
					pixels: decodeCanvasToPixels(stuff.canvas, collection.palette),
					stuff,
					tokenId,
				};
			}),
		);

		return pieces;
	} catch {
		throw new Error("ICI");
	}
});

export { getWallPieces };

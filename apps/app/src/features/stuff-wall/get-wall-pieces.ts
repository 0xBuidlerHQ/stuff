import { stuffErc721Config } from "@0xhq/stuff.contracts";
import type { StuffERC721 } from "@0xhq/stuff.contracts/types.user";
import { cache } from "react";
import type { Address } from "viem";
import { readContract } from "wagmi/actions";
import { wagmiConfig } from "@/providers/wagmi.config";

type WallPiece = {
	tokenId: bigint;
	owner: Address;
	stuff: StuffERC721.Stuff;
	pixels: string[];
};

const CANVAS_SIZE = 42;

const decodeCanvasToPixels = (canvas: string, palette: readonly string[]) => {
	const hex = canvas.startsWith("0x") ? canvas.slice(2) : canvas;
	const pixels: string[] = [];

	for (let index = 0; index < hex.length; index += 2) {
		const paletteIndex = Number.parseInt(hex.slice(index, index + 2), 16);
		pixels.push(palette[paletteIndex] ?? "transparent");
	}

	return pixels;
};

const getWallPieces = cache(
	async (stuffAddress: Address, collection: StuffERC721.StuffCollection): Promise<WallPiece[]> => {
		try {
			const tokenIdsIndex = (await readContract(wagmiConfig(), {
				abi: stuffErc721Config.abi,
				functionName: "tokenIdsIndex",
				address: stuffAddress,
			})) as bigint;

			const tokenIds = Array.from({ length: Number(tokenIdsIndex) }, (_, index) => BigInt(index));
			const pieces = await Promise.all(
				tokenIds.map(async (index) => {
					const tokenId = (await readContract(wagmiConfig(), {
						abi: stuffErc721Config.abi,
						functionName: "tokenByIndex",
						args: [index],
						address: stuffAddress,
					})) as bigint;

					const [owner, stuff] = (await Promise.all([
						readContract(wagmiConfig(), {
							abi: stuffErc721Config.abi,
							functionName: "ownerOf",
							args: [tokenId],
							address: stuffAddress,
						}),
						readContract(wagmiConfig(), {
							abi: stuffErc721Config.abi,
							functionName: "getStuff",
							args: [tokenId],
							address: stuffAddress,
						}),
					])) as [Address, StuffERC721.Stuff];

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
	},
);

export type { WallPiece };
export { CANVAS_SIZE, decodeCanvasToPixels, getWallPieces };

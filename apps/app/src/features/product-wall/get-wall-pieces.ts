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

const getFakeWallPieces = (collection: StuffERC721.StuffCollection): WallPiece[] => {
	const palette = collection.palette;
	const background = palette[0] ?? "transparent";
	const accent = palette[1] ?? palette[0] ?? "transparent";

	return Array.from({ length: 8 }, (_, itemIndex) => {
		const pixels = Array.from({ length: CANVAS_SIZE * CANVAS_SIZE }, (_, pixelIndex) => {
			const x = pixelIndex % CANVAS_SIZE;
			const y = Math.floor(pixelIndex / CANVAS_SIZE);
			const isAccent =
				itemIndex % 2 === 0
					? (x + y + itemIndex) % 7 === 0
					: x > 8 + itemIndex && x < 30 && y > 8 && y < 30 && (x + y) % (itemIndex + 3) < 2;

			return isAccent ? accent : background;
		});

		return {
			owner: "0x0000000000000000000000000000000000000000",
			pixels,
			stuff: {
				author: `Sample ${itemIndex + 1}`,
				authorAddress: "0x0000000000000000000000000000000000000000",
				canvas: "0x",
				creationDate: BigInt(0),
				description: "Mock wall piece shown because this collection has no minted items yet.",
				options: collection.options.map((option) => [option[0], option[1] ?? ""]),
				title: `Untitled ${itemIndex + 1}`,
			},
			tokenId: BigInt(itemIndex),
		};
	});
};

const getWallPieces = cache(
	async (stuffAddress: Address, collection: StuffERC721.StuffCollection): Promise<WallPiece[]> => {
		try {
			const tokenIdsIndex = (await readContract(wagmiConfig(), {
				abi: stuffErc721Config.abi,
				functionName: "tokenIdsIndex",
				address: stuffAddress,
			})) as bigint;

			if (tokenIdsIndex === BigInt(0)) {
				return getFakeWallPieces(collection);
			}

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

			return pieces.length > 0 ? pieces : getFakeWallPieces(collection);
		} catch {
			return getFakeWallPieces(collection);
		}
	},
);

export type { WallPiece };
export { CANVAS_SIZE, getWallPieces };

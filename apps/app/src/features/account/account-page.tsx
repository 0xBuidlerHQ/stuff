"use client";

import { stuffErc721Config } from "@0xhq/stuff.contracts";
import type { StuffERC721 } from "@0xhq/stuff.contracts/types.user";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { readContract } from "wagmi/actions";
import { links } from "@/config/links";
import { GridPreview } from "@/features/product-configurator/grid";
import { decodeCanvasToPixels } from "@/features/product-wall/get-wall-pieces";
import { ConnectButton } from "@/features/web3/connectButton";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";
import { wagmiConfig } from "@/providers/wagmi.config";
import { useWeb3 } from "@/providers/web3";

type AccountProject = {
	slug: string;
	stuffAddress: Address;
	collection: StuffERC721.StuffCollection;
};

type OwnedPiece = {
	collection: StuffERC721.StuffCollection;
	pixels: string[];
	slug: string;
	stuff: StuffERC721.Stuff;
	stuffAddress: Address;
	tokenId: bigint;
};

const loadOwnedPieces = async (owner: Address, projects: AccountProject[]) => {
	const config = wagmiConfig();
	const pieces = await Promise.all(
		projects.map(async (project) => {
			const balance = (await readContract(config, {
				abi: stuffErc721Config.abi,
				address: project.stuffAddress,
				functionName: "balanceOf",
				args: [owner],
			})) as bigint;

			if (balance === BigInt(0)) return [];

			const indexes = Array.from({ length: Number(balance) }, (_, index) => BigInt(index));
			return Promise.all(
				indexes.map(async (index) => {
					const tokenId = (await readContract(config, {
						abi: stuffErc721Config.abi,
						address: project.stuffAddress,
						functionName: "tokenOfOwnerByIndex",
						args: [owner, index],
					})) as bigint;

					const stuff = (await readContract(config, {
						abi: stuffErc721Config.abi,
						address: project.stuffAddress,
						functionName: "getStuff",
						args: [tokenId],
					})) as StuffERC721.Stuff;

					return {
						collection: project.collection,
						pixels: decodeCanvasToPixels(stuff.canvas, project.collection.palette),
						slug: project.slug,
						stuff,
						stuffAddress: project.stuffAddress,
						tokenId,
					} satisfies OwnedPiece;
				}),
			);
		}),
	);

	return pieces.flat();
};

const OwnedPieceCard = ({ piece }: { piece: OwnedPiece }) => {
	return (
		<Link
			href={`${links.wall.url}/${piece.slug}/${piece.tokenId.toString()}`}
			className="grid gap-3 border border-border bg-background p-4 transition hover:bg-muted/30"
		>
			<GridPreview size={42} pixels={piece.pixels} className="border-border" />

			<Box className="grid gap-1">
				<Box className="text-lg leading-tight">{piece.stuff.title || `#${piece.tokenId}`}</Box>
				<Box className="text-xs text-muted-foreground">
					/{piece.collection.category} / {piece.collection.sku}
				</Box>
			</Box>

			<Box className="grid gap-2 text-sm">
				<Box className="grid gap-1">
					<Box className="text-[11px] uppercase text-muted-foreground">Author</Box>
					<Box>{piece.stuff.author || "-"}</Box>
				</Box>

				<Box className="grid gap-1">
					<Box className="text-[11px] uppercase text-muted-foreground">Token</Box>
					<Box>#{piece.tokenId.toString()}</Box>
				</Box>
			</Box>

			<Box className="text-sm underline underline-offset-4">View item page</Box>
		</Link>
	);
};

const AccountPage = ({ projects }: { projects: AccountProject[] }) => {
	const { eoa, isConnected, status } = useWeb3();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [pieces, setPieces] = useState<OwnedPiece[]>([]);

	const owner = eoa.address as Address | undefined;

	useEffect(() => {
		if (!isConnected || !owner) {
			setPieces([]);
			setErrorMessage(null);
			setIsLoading(false);
			return;
		}

		let cancelled = false;

		const run = async () => {
			try {
				setIsLoading(true);
				setErrorMessage(null);
				const nextPieces = await loadOwnedPieces(owner, projects);
				if (!cancelled) setPieces(nextPieces);
			} catch (error) {
				if (!cancelled) {
					setErrorMessage(error instanceof Error ? error.message : "Failed to load owned pieces.");
					setPieces([]);
				}
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};

		run();

		return () => {
			cancelled = true;
		};
	}, [isConnected, owner, projects]);

	const collectionCount = useMemo(
		() => new Set(pieces.map((piece) => piece.stuffAddress.toLowerCase())).size,
		[pieces],
	);

	return (
		<Container>
			{!isConnected ? (
				<Box className="grid gap-4 border border-border bg-background p-6">
					<Box className="text-sm text-muted-foreground">
						Log in with the wallet that holds your pieces to load your inventory.
					</Box>
					<Box className="w-fit">
						<ConnectButton />
					</Box>
				</Box>
			) : null}

			{isConnected ? (
				<Box className="grid gap-4">
					<Box className="flex flex-wrap items-center gap-6 border border-border bg-background p-4 text-sm">
						<Box className="grid gap-1">
							<Box className="text-[11px] uppercase text-muted-foreground">Wallet</Box>
							<Box className="break-all">{owner}</Box>
						</Box>
						<Box className="grid gap-1">
							<Box className="text-[11px] uppercase text-muted-foreground">Pieces</Box>
							<Box>{pieces.length}</Box>
						</Box>
						<Box className="grid gap-1">
							<Box className="text-[11px] uppercase text-muted-foreground">Collections</Box>
							<Box>{collectionCount}</Box>
						</Box>
						<Box className="grid gap-1">
							<Box className="text-[11px] uppercase text-muted-foreground">Status</Box>
							<Box>{isLoading ? "Loading" : status}</Box>
						</Box>
					</Box>

					{errorMessage ? <Box className="text-sm text-red-500">{errorMessage}</Box> : null}

					{!isLoading && !errorMessage && pieces.length === 0 ? (
						<Box className="border border-border bg-background p-6 text-sm text-muted-foreground">
							No pieces found for this wallet yet.
						</Box>
					) : null}

					{pieces.length > 0 ? (
						<Box className="grid gap-4 desktop:grid-cols-3">
							{pieces.map((piece) => (
								<OwnedPieceCard
									key={`${piece.stuffAddress}-${piece.tokenId.toString()}`}
									piece={piece}
								/>
							))}
						</Box>
					) : null}
				</Box>
			) : null}
		</Container>
	);
};

export type { AccountProject };
export { AccountPage };

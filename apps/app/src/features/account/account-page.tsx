"use client";

import { stuffErc721Config } from "@0xhq/stuff.contracts";
import type { StuffERC721 } from "@0xhq/stuff.contracts/types.user";
import Link from "next/link";
import { useMemo } from "react";
import type { Address } from "viem";
import { useReadContracts } from "wagmi";
import { links } from "@/config/links";
import { GridPreview } from "@/features/stuff-configurator/grid";
import { decodeCanvasToPixels } from "@/features/stuff-wall/get-wall-pieces";
import type { Stuff } from "@/features/stuff/type";
import { ConnectButton } from "@/features/web3/connectButton";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";
import { useWeb3 } from "@/providers/web3";

type AccountProject = {
	slug: string;
	stuffAddress: Address;
	collection: StuffERC721.StuffBlueprint;
};

type OwnedPiece = {
	collection: StuffERC721.StuffBlueprint;
	pixels: string[];
	slug: string;
	stuff: StuffERC721.Stuff;
	stuffAddress: Address;
	tokenId: bigint;
};

type ContractResult<T> = {
	error?: Error;
	result?: T;
	status: "failure" | "success";
};

const getSuccessfulResult = <T,>(value: unknown) => {
	if (!value || typeof value !== "object" || !("status" in value)) return undefined;

	const contractResult = value as ContractResult<T>;
	return contractResult.status === "success" ? contractResult.result : undefined;
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

type AccountPageProps = { stuffs: Stuff[] };

const AccountPage = ({ stuffs }: AccountPageProps) => {
	const { eoa, isConnected, status } = useWeb3();
	const owner = eoa.address as Address | undefined;

	const projects = useMemo<AccountProject[]>(
		() =>
			stuffs.map((stuff) => ({
				collection: stuff.blueprint,
				slug: stuff.slug,
				stuffAddress: stuff.address,
			})),
		[stuffs],
	);

	const balanceContracts = useMemo(
		() =>
			isConnected && owner
				? projects.map((project) => ({
						abi: stuffErc721Config.abi,
						address: project.stuffAddress,
						functionName: "balanceOf" as const,
						args: [owner] as const,
					}))
				: [],
		[isConnected, owner, projects],
	);

	const balancesQuery = useReadContracts({
		allowFailure: true,
		contracts: balanceContracts,
		query: {
			enabled: balanceContracts.length > 0,
		},
	});

	const ownedProjects = useMemo(
		() =>
			projects
				.map((project, index) => {
					const balance = getSuccessfulResult<bigint>(balancesQuery.data?.[index]);
					return balance && balance > BigInt(0) ? { balance, project } : undefined;
				})
				.filter((value): value is { balance: bigint; project: AccountProject } => Boolean(value)),
		[balancesQuery.data, projects],
	);

	const tokenLookupEntries = useMemo(
		() =>
			ownedProjects.flatMap(({ balance, project }) =>
				Array.from({ length: Number(balance) }, (_, index) => ({
					index: BigInt(index),
					project,
				})),
			),
		[ownedProjects],
	);

	const tokenContracts = useMemo(
		() =>
			isConnected && owner
				? tokenLookupEntries.map(({ index, project }) => ({
						abi: stuffErc721Config.abi,
						address: project.stuffAddress,
						functionName: "tokenOfOwnerByIndex" as const,
						args: [owner, index] as const,
					}))
				: [],
		[isConnected, owner, tokenLookupEntries],
	);

	const tokenIdsQuery = useReadContracts({
		allowFailure: true,
		contracts: tokenContracts,
		query: {
			enabled: tokenContracts.length > 0,
		},
	});

	const ownedTokens = useMemo(
		() =>
			tokenLookupEntries
				.map((entry, index) => {
					const tokenId = getSuccessfulResult<bigint>(tokenIdsQuery.data?.[index]);
					return tokenId !== undefined ? { ...entry, tokenId } : undefined;
				})
				.filter(
					(
						value,
					): value is {
						index: bigint;
						project: AccountProject;
						tokenId: bigint;
					} => Boolean(value),
				),
		[tokenIdsQuery.data, tokenLookupEntries],
	);

	const pieceContracts = useMemo(
		() =>
			ownedTokens.map(({ project, tokenId }) => ({
				abi: stuffErc721Config.abi,
				address: project.stuffAddress,
				functionName: "getStuff" as const,
				args: [tokenId] as const,
			})),
		[ownedTokens],
	);

	const piecesQuery = useReadContracts({
		allowFailure: true,
		contracts: pieceContracts,
		query: {
			enabled: pieceContracts.length > 0,
		},
	});

	const pieces = useMemo(
		() =>
			ownedTokens
				.map((ownedToken, index) => {
					const stuff = getSuccessfulResult<StuffERC721.Stuff>(piecesQuery.data?.[index]);

					if (!stuff) return undefined;

					return {
						collection: ownedToken.project.collection,
						pixels: decodeCanvasToPixels(stuff.canvas, ownedToken.project.collection.palette),
						slug: ownedToken.project.slug,
						stuff,
						stuffAddress: ownedToken.project.stuffAddress,
						tokenId: ownedToken.tokenId,
					} satisfies OwnedPiece;
				})
				.filter((piece): piece is OwnedPiece => Boolean(piece)),
		[ownedTokens, piecesQuery.data],
	);

	const errorMessage = useMemo(() => {
		const queryError =
			balancesQuery.error ?? tokenIdsQuery.error ?? piecesQuery.error ?? null;

		if (queryError) {
			return queryError instanceof Error ? queryError.message : "Failed to load owned pieces.";
		}

		const hasFailure =
			(balancesQuery.data ?? []).some((result) => result?.status === "failure") ||
			(tokenIdsQuery.data ?? []).some((result) => result?.status === "failure") ||
			(piecesQuery.data ?? []).some((result) => result?.status === "failure");

		return hasFailure ? "Failed to load some owned pieces." : null;
	}, [
		balancesQuery.data,
		balancesQuery.error,
		piecesQuery.data,
		piecesQuery.error,
		tokenIdsQuery.data,
		tokenIdsQuery.error,
	]);

	const isLoading =
		balancesQuery.isLoading ||
		balancesQuery.isPending ||
		tokenIdsQuery.isLoading ||
		tokenIdsQuery.isPending ||
		piecesQuery.isLoading ||
		piecesQuery.isPending;

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

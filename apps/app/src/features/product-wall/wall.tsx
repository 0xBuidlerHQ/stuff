"use client";

import { Beaut } from "@0xhq/beaut";
import type { StuffERC721 } from "@0xhq/stuff.contracts/types.user";
import { useState } from "react";
import { GridPreview } from "@/features/product-configurator/grid";
import type { WallPiece } from "@/features/product-wall/get-wall-pieces";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";
import { Drawer, DrawerContent, DrawerTitle } from "@/shadcn/drawer";

type ProductWallProps = {
	collection: StuffERC721.StuffCollection;
	pieces: WallPiece[];
};

const WallPieceCard = ({
	onPreview,
	piece,
}: {
	onPreview: (piece: WallPiece) => void;
	piece: WallPiece;
}) => {
	return (
		<button
			type="button"
			className="grid gap-2 text-left"
			onMouseEnter={() => onPreview(piece)}
			onFocus={() => onPreview(piece)}
			onClick={() => onPreview(piece)}
		>
			<GridPreview
				size={42}
				pixels={piece.pixels}
				className="border-border transition hover:border-foreground"
			/>
			<Box className="grid gap-0.5">
				<Box className="text-sm">{piece.stuff.title || `#${piece.tokenId}`}</Box>
				<Box className="text-xs text-muted-foreground">{piece.stuff.author || "-"}</Box>
			</Box>
		</button>
	);
};

const PieceDrawer = ({
	collection,
	onOpenChange,
	open,
	piece,
}: {
	collection: StuffERC721.StuffCollection;
	onOpenChange: (open: boolean) => void;
	open: boolean;
	piece: WallPiece | null;
}) => {
	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="bg-background text-foreground">
				<Container className="overflow-y-auto">
					<DrawerTitle className="hidden">Wall Piece</DrawerTitle>

					<Box className="grid gap-6 px-4 py-6 desktop:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
						<Box className="grid gap-4">
							<Box className="text-3xl">{piece?.stuff.title || "-"}</Box>
							<Box className="text-sm text-muted-foreground">
								/{collection.category} / {collection.sku}
							</Box>
							<Box className="grid gap-2">
								<Box className="text-xs uppercase text-muted-foreground">Author</Box>
								<Box>{piece?.stuff.author || "-"}</Box>
							</Box>
							<Box className="grid gap-2">
								<Box className="text-xs uppercase text-muted-foreground">Owner</Box>
								<Box className="break-all text-sm">{piece?.owner || "-"}</Box>
							</Box>
							<Box className="grid gap-2">
								<Box className="text-xs uppercase text-muted-foreground">Description</Box>
								<Box>{piece?.stuff.description || "-"}</Box>
							</Box>
							<Box className="grid gap-2">
								<Box className="text-xs uppercase text-muted-foreground">Token</Box>
								<Box>#{piece?.tokenId.toString() ?? "-"}</Box>
							</Box>
							<Box className="grid gap-2">
								<Box className="text-xs uppercase text-muted-foreground">Mint Price</Box>
								<Box>{Beaut.money(Number(Beaut.bigint(collection.mintPriceToken, 6)))}</Box>
							</Box>
							<Box className="grid gap-2">
								<Box className="text-xs uppercase text-muted-foreground">Options</Box>
								<Box className="grid gap-2">
									{(piece?.stuff.options ?? []).map(([name, value]) => (
										<Box key={`${name}-${value}`} className="flex gap-3 border-b border-muted pb-2">
											<Box className="capitalize text-muted-foreground">{name}</Box>
											<Box>{value}</Box>
										</Box>
									))}
								</Box>
							</Box>
						</Box>

						<Box className="desktop:justify-self-end desktop:w-[min(100%,560px)]">
							{piece ? <GridPreview size={42} pixels={piece.pixels} /> : null}
						</Box>
					</Box>
				</Container>
			</DrawerContent>
		</Drawer>
	);
};

const ProductWall = ({ collection, pieces }: ProductWallProps) => {
	const [selectedPiece, setSelectedPiece] = useState<WallPiece | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const openPreview = (piece: WallPiece) => {
		setSelectedPiece(piece);
		setDrawerOpen(true);
	};

	return (
		<>
			<Container>
				<Box className="grid gap-8">
					<Box className="grid gap-2">
						<Box className="text-sm text-muted-foreground">/{collection.category}</Box>
						<Box className="text-4xl">{collection.sku} Wall</Box>
						<Box className="text-sm text-muted-foreground">
							All minted pieces for this collection, arranged as a live wall.
						</Box>
					</Box>

					<Box className="grid grid-cols-2 gap-4 desktop:grid-cols-6">
						{pieces.map((piece) => (
							<WallPieceCard
								key={`${collection.sku}-${piece.tokenId.toString()}`}
								piece={piece}
								onPreview={openPreview}
							/>
						))}
					</Box>
				</Box>
			</Container>

			<PieceDrawer
				collection={collection}
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
				piece={selectedPiece}
			/>
		</>
	);
};

export { ProductWall };

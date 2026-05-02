"use client";

import type { StuffERC721 } from "@0xhq/stuff.contracts/types.user";
import Link from "next/link";
import { links } from "@/config/links";
import { GridPreview } from "@/features/product-configurator/grid";
import type { WallPiece } from "@/features/product-wall/get-wall-pieces";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";

type ProductWallProps = {
	collection: StuffERC721.StuffCollection;
	pieces: WallPiece[];
	slug: string;
};

const WallPieceCard = ({ piece, slug }: { piece: WallPiece; slug: string }) => {
	return (
		<Link
			href={`${links.wall.url}/${slug}/${piece.tokenId.toString()}`}
			className="grid gap-2 text-left"
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
		</Link>
	);
};

const ProductWallSection = ({ collection, pieces, slug }: ProductWallProps) => {
	return (
		<Box className="grid gap-4">
			<Box className="grid gap-2">
				<Box className="text-4xl">{collection.sku}</Box>
			</Box>

			<Box className="grid grid-cols-2 gap-4 desktop:grid-cols-6">
				{pieces.map((piece) => (
					<WallPieceCard
						key={`${collection.sku}-${piece.tokenId.toString()}`}
						piece={piece}
						slug={slug}
					/>
				))}
			</Box>
		</Box>
	);
};

const ProductWall = ({ collection, pieces, slug }: ProductWallProps) => {
	return (
		<Container>
			<ProductWallSection collection={collection} pieces={pieces} slug={slug} />
		</Container>
	);
};

export { ProductWall, ProductWallSection };

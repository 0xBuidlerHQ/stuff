"use client";

import Link from "next/link";
import { links } from "@/config/links";
import { GridPreview } from "@/features/grid";
import type { Stuff, WallPiece } from "@/features/stuff/types";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";

type StuffWallProps = {
	stuff: Stuff;
	pieces: WallPiece[];
};

const WallPieceCard = ({ piece, stuff }: { piece: WallPiece; stuff: Stuff }) => {
	return (
		<Link
			href={`${links.wall.url}/${stuff.slug}/${piece.tokenId.toString()}`}
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

const StuffWallSection = ({ stuff, pieces }: StuffWallProps) => {
	return (
		<Box className="grid gap-4">
			<Box className="grid gap-2">
				<Box className="text-4xl">{stuff.sku}</Box>
			</Box>

			<Box className="grid grid-cols-2 gap-4 desktop:grid-cols-6">
				{pieces.map((piece) => (
					<WallPieceCard
						key={`${stuff.slug}-${piece.tokenId.toString()}`}
						piece={piece}
						stuff={stuff}
					/>
				))}
			</Box>
		</Box>
	);
};

const StuffWall = ({ stuff, pieces }: StuffWallProps) => {
	return (
		<Container>
			<StuffWallSection stuff={stuff} pieces={pieces} />
		</Container>
	);
};

export { StuffWall, StuffWallSection };

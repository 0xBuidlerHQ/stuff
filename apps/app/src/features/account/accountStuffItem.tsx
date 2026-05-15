"use client";

import { Beaut } from "@0xhq/beaut";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { StuffItem } from "@/config/types";
import { GridPreview } from "@/features/grid/gridPreview";
import { Box } from "@/primitives/box";
import { useStuffEcosystem } from "@/providers/stuff-ecosystem";

type AccountStuffItemProps = {
	stuffItem: StuffItem;
};

const AccountStuffItem = (props: AccountStuffItemProps) => {
	const stuffItem = props.stuffItem;
	const collection = stuffItem.collection;
	const { decodeCanvasToPixels } = useStuffEcosystem();
	const pixels = decodeCanvasToPixels(stuffItem.canvas);
	const displayTitle = stuffItem.title || `#${stuffItem.tokenId}`;
	const displayPrice = Beaut.money(Number(Beaut.bigint(collection.mintPriceToken, 6)));
	const href = `/stuffs/${collection.slug}/${stuffItem.tokenId.toString()}`;

	return (
		<Box className="flex items-center gap-3 border border-border bg-background p-1 desktop:gap-4">
			<Box className="flex shrink-0 items-center gap-2">
				<Box className="relative size-18 overflow-hidden bg-muted desktop:size-22">
					<GridPreview pixels={pixels} />
				</Box>

				<Box className="relative size-18 overflow-hidden bg-muted desktop:size-22">
					<Image
						fill
						className="object-cover"
						src={collection.assets.images[0]}
						alt={collection.sku}
					/>
				</Box>
			</Box>

			<Box className="grid min-w-0 flex-1 gap-1 py-2">
				<Box className="truncate text-base desktop:text-xl">{displayTitle}</Box>
				<Box className="flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground desktop:text-sm">
					<Box className="truncate">{collection.sku}</Box>
					<Box>{displayPrice}</Box>
					<Box>#{stuffItem.tokenId.toString()}</Box>
				</Box>
			</Box>

			<Link
				href={href}
				className="flex size-10 shrink-0 items-center justify-center bg-foreground text-background transition-opacity hover:opacity-90"
				aria-label={`Open details for ${displayTitle}`}
			>
				<ChevronRight className="size-5" aria-hidden />
			</Link>
		</Box>
	);
};

export { AccountStuffItem };

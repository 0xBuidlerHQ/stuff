"use client";

import { Beaut } from "@0xhq/beaut";
import Image from "next/image";
import { links } from "@/config/links";
import type { Stuff as StuffPrimitive } from "@/features/stuff/type";
import { Box } from "@/primitives/box";
import { Button } from "@/primitives/button";

type StuffCardProps = {
	stuff: StuffPrimitive;
};

const Stuff = ({ stuff }: StuffCardProps) => {
	return (
		<Button href={`${links.stuffs.url}/${stuff.slug}`}>
			<Box className="flex flex-col">
				<Box className="bg-foreground text-background flex justify-between px-2">
					<Box className="text-xs">+ {stuff.slug}</Box>
				</Box>

				<Image
					className="border border-border object-cover aspect-square"
					src={stuff.assets.images[0]}
					alt={stuff.blueprint.sku}
				/>

				<Box className="flex justify-between px-2 bg-muted border-x border-x-border">
					<Box className="text-xs">Supply:</Box>
					<Box className="text-xs">1/{Beaut.bigint(stuff.blueprint.maxSupply, 1)}</Box>
				</Box>

				<Box className="bg-foreground text-background border border-border flex justify-between px-2">
					<Box className="text-xs">Price:</Box>
					<Box className="text-xs">
						{Beaut.money(Number(Beaut.bigint(stuff.blueprint.mintPriceToken, 6)))}
					</Box>
				</Box>
			</Box>
		</Button>
	);
};

export { Stuff };

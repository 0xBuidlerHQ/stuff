import { Beaut } from "@0xhq/beaut";
import Image from "next/image";
import { links } from "@/config/links";
import type { StuffCollection } from "@/config/types";
import { Box } from "@/primitives/box";
import { Button } from "@/primitives/button";

type StuffCollectionsProps = {
	stuffCollections: StuffCollection[];
};

const StuffCollections = (props: StuffCollectionsProps) => {
	return (
		<Box>
			{props.stuffCollections.map((stuffCollection) => {
				return (
					<Box key={stuffCollection.id}>
						<Button href={`${links.stuffs.url}/${stuffCollection.slug}`}>
							<Box className="flex flex-col">
								<Box className="bg-foreground text-background flex justify-between px-2">
									<Box className="text-xs">+ {stuffCollection.slug}</Box>
								</Box>

								<Image
									className="border border-border object-cover aspect-square"
									src={stuffCollection.assets.images[0]}
									alt={stuffCollection.sku}
								/>

								<Box className="flex justify-between px-2 bg-muted border-x border-x-border">
									<Box className="text-xs">Supply:</Box>
									<Box className="text-xs">
										{Beaut.bigint(stuffCollection.currentSupply, 0)}/
										{Beaut.bigint(stuffCollection.maxSupply, 0)}
									</Box>
								</Box>

								<Box className="bg-foreground text-background border border-border flex justify-between px-2">
									<Box className="text-xs">Price:</Box>
									<Box className="text-xs">
										{Beaut.money(Number(Beaut.bigint(stuffCollection.mintPriceToken, 6)))}
									</Box>
								</Box>
							</Box>
						</Button>
					</Box>
				);
			})}
		</Box>
	);
};

export { StuffCollections };

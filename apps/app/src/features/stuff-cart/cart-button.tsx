"use client";

import { ShoppingCart } from "lucide-react";
import { links } from "@/config/links";
import { Box } from "@/primitives/box";
import { Button } from "@/primitives/button";
import { useStuffCartStore } from "./store";

const CartButton = () => {
	const itemsCount = useStuffCartStore((state) => state.items.length);

	return (
		<Button href={links.cart.url} className="relative flex items-center justify-center">
			<ShoppingCart className="size-5" strokeWidth={1.75} />
			{itemsCount > 0 ? (
				<Box className="absolute -right-2 -top-2 min-w-5 bg-foreground px-1 text-center text-[10px] text-background">
					{itemsCount}
				</Box>
			) : null}
		</Button>
	);
};

export { CartButton };

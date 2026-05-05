"use client";

import { links } from "@/config/links";
import { Box } from "@/primitives/box";
import { Button } from "@/primitives/button";

const CartButton = () => {
	return (
		<Button href={links.cart.url} className="relative flex items-center justify-center">
			<Box>cart</Box>
		</Button>
	);
};

export { CartButton };

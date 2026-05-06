"use client";

import { usePathname } from "next/navigation";
import { links } from "@/config/links";
import { useCartStore } from "@/features/cart/store";
import { isActive, NavigationItem } from "@/layouts/header/navigation";
import { Box } from "@/primitives/box";

const CartNavigationItem = () => {
	const cart = useCartStore();

	const pathname = usePathname();

	return (
		<Box className="relative">
			<NavigationItem
				key={links.cart.name}
				isActive={isActive(pathname, links.cart.url)}
				{...links.cart}
			/>

			{cart.items.length > 0 && (
				<Box className="absolute -top-3 right-0.5 text-[10px] text-red-500 font-semibold">
					{cart.items.length}
				</Box>
			)}
		</Box>
	);
};

export { CartNavigationItem };

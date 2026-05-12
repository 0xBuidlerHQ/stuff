"use client";

import type { StuffCollection } from "@/config/types";
import { CartItem } from "@/features/cart/cartItem";
import { CartWidget } from "@/features/cart/cartWidget";
import { useCartStore } from "@/features/cart/store";
import { Box } from "@/primitives/box";

type CartPageProps = {
	stuffCollections: StuffCollection[];
};

const CartPage = (props: CartPageProps) => {
	const cartStore = useCartStore();

	const stuffCollectionsByAddress = new Map(
		props.stuffCollections.map((stuffCollection) => [
			stuffCollection.address.toLowerCase(),
			stuffCollection,
		]),
	);

	return (
		<Box className="grid gap-6 desktop:grid-cols-12 desktop:items-start">
			<Box className="grid gap-4 desktop:col-span-8">
				{cartStore.items.map((cartItem) => {
					const stuffCollection = stuffCollectionsByAddress.get(
						cartItem.stuffCollectionAddress.toLowerCase(),
					);
					if (!stuffCollection) return null;

					return (
						<CartItem
							key={`${cartItem.stuffCollectionAddress}-${cartItem.title}-${cartItem.author}`}
							cartItem={cartItem}
							onRemove={cartStore.removeItem}
							stuffCollection={stuffCollection}
						/>
					);
				})}
			</Box>

			<Box className="desktop:sticky desktop:top-2 desktop:col-span-4 desktop:self-start">
				<CartWidget
					checkoutCTA
					items={cartStore.items}
					stuffCollectionsByAddress={stuffCollectionsByAddress}
				/>
			</Box>
		</Box>
	);
};

export { CartPage };

"use client";

import { Beaut } from "@0xhq/beaut";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { GridPreview } from "@/features/grid";
import { Box } from "@/primitives/box";
import { Button, ButtonPrimary } from "@/primitives/button";
import { type StuffCartItem, useStuffCartStore } from "./store";
import { useStuffPurchase } from "./use-stuff-purchase";

const CartPurchaseButton = ({ item }: { item: StuffCartItem }) => {
	const removeItem = useStuffCartStore((state) => state.removeItem);
	const { errorMessage, isPending, label, pay } = useStuffPurchase(item, {
		onSuccess: () => removeItem(item),
	});

	return (
		<Box className="grid gap-2">
			<ButtonPrimary onClick={pay} disabled={isPending} className="w-full justify-center">
				{label}
			</ButtonPrimary>
			{errorMessage ? <Box className="text-xs text-red-500">{errorMessage}</Box> : null}
		</Box>
	);
};

const CartItemCard = ({ item }: { item: StuffCartItem }) => {
	const removeItem = useStuffCartStore((state) => state.removeItem);

	return (
		<Box className="grid gap-6 border border-border bg-background p-4 desktop:grid-cols-[120px_minmax(0,1fr)_240px]">
			<Box className="relative aspect-square overflow-hidden border border-border bg-muted">
				<Image
					fill
					className="object-cover"
					src={item.stuffCollection.assets.images[0]}
					alt={item.stuffCollection.slug}
				/>
			</Box>

			<Box className="grid gap-4">
				<Box className="flex items-start justify-between gap-4">
					<Box className="grid gap-1">
						<Box className="text-2xl">{item.stuffCollection.sku}</Box>
						<Box className="text-xs text-muted-foreground">{item.title || "-"}</Box>
					</Box>

					<Button
						onClick={() => removeItem(item)}
						className="text-muted-foreground hover:text-foreground"
					>
						<Trash2 className="size-4" strokeWidth={1.75} />
					</Button>
				</Box>

				<Box className="grid gap-3 text-sm">
					<Box>
						<Box className="text-[11px] uppercase text-muted-foreground">Author</Box>
						<Box>{item.author || "-"}</Box>
					</Box>
					<Box>
						<Box className="text-[11px] uppercase text-muted-foreground">Description</Box>
						<Box className="text-muted-foreground">{item.description || "-"}</Box>
					</Box>
					<Box>
						<Box className="text-[11px] uppercase text-muted-foreground">Options</Box>
						<Box className="grid gap-1">
							{Object.entries(item.selectedOptions).map(([name, value]) => (
								<Box key={name} className="flex gap-2">
									<Box className="capitalize text-muted-foreground">{name}</Box>
									<Box>{value}</Box>
								</Box>
							))}
						</Box>
					</Box>
				</Box>
			</Box>

			<Box className="grid gap-4">
				<GridPreview
					size={item.design.size}
					pixels={item.design.pixels}
					className="border-border"
				/>
				<Box className="flex items-center justify-between">
					<Box className="text-xs text-muted-foreground">Price</Box>
					<Box className="text-xl">
						{Beaut.money(Number(Beaut.bigint(item.stuffCollection.mintPriceToken, 6)))}
					</Box>
				</Box>
				<CartPurchaseButton item={item} />
			</Box>
		</Box>
	);
};

const StuffCartPage = () => {
	const items = useStuffCartStore((state) => state.items);
	const clearItems = useStuffCartStore((state) => state.clearItems);
	const total = items.reduce((sum, item) => sum + item.stuffCollection.mintPriceToken, BigInt(0));

	if (items.length === 0) {
		return (
			<Box className="grid gap-4 border border-border bg-background p-6">
				<Box className="text-3xl">Cart</Box>
				<Box className="text-sm text-muted-foreground">Your cart is empty.</Box>
			</Box>
		);
	}

	return (
		<Box className="grid gap-6">
			<Box className="flex items-end justify-between gap-4">
				<Box className="grid gap-1">
					<Box className="text-4xl">Cart</Box>
					<Box className="text-sm text-muted-foreground">
						{items.length} {items.length === 1 ? "item" : "items"}
					</Box>
				</Box>

				<Box className="grid justify-items-end gap-1">
					<Box className="text-xs text-muted-foreground">Total</Box>
					<Box className="text-2xl">{Beaut.money(Number(Beaut.bigint(total, 6)))}</Box>
					<Button
						onClick={clearItems}
						className="text-xs text-muted-foreground hover:text-foreground"
					>
						Clear cart
					</Button>
				</Box>
			</Box>

			<Box className="grid gap-4">
				{items.map((item) => (
					<CartItemCard
						key={`${item.stuffCollection.address}-${item.title}-${item.author}`}
						item={item}
					/>
				))}
			</Box>
		</Box>
	);
};

export { StuffCartPage };

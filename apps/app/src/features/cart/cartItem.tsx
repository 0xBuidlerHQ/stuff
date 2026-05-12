"use client";

import { Beaut } from "@0xhq/beaut";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import type { PropsWithChildren } from "react";
import type { StuffCollection, StuffItemCart } from "@/config/types";
import { decodeCanvasToPixels, GridPreview } from "@/features/grid";
import { Box } from "@/primitives/box";
import { Button } from "@/primitives/button";

type CartItemElementProps = {
	label: string;
} & PropsWithChildren;

const CartItemElement = (props: CartItemElementProps) => {
	return (
		<Box className="flex items-center gap-1">
			<Box className="text-xs text-muted-foreground">{props.label}:</Box>
			<Box>{props.children}</Box>
		</Box>
	);
};

const CartItem2Element = (props: CartItemElementProps) => {
	return (
		<Box className="flex flex-col">
			<Box className="text-xs text-muted-foreground">{props.label}:</Box>
			<Box>{props.children}</Box>
		</Box>
	);
};

type CartItemProps = {
	cartItem: StuffItemCart;
	onRemove: (cartItem: StuffItemCart) => void;
	stuffCollection: StuffCollection;
};

const CartItem = (props: CartItemProps) => {
	const cartItem = props.cartItem;
	const stuffCollection = props.stuffCollection;

	const pixels = decodeCanvasToPixels(cartItem.canvas, stuffCollection.palette);

	return (
		<Box className="grid border border-border bg-background desktop:grid-cols-12">
			<Box className="relative desktop:col-span-3">
				<Box className="relative aspect-square overflow-hidden bg-muted">
					<GridPreview pixels={pixels} />
				</Box>

				<Box className="absolute right-0 bottom-0 aspect-square w-16 overflow-hidden border border-border bg-muted desktop:w-20">
					<Image
						fill
						className="object-cover"
						src={stuffCollection.assets.images[0]}
						alt={stuffCollection.sku}
					/>
				</Box>
			</Box>

			<Box className="flex min-w-0 grow flex-col p-4 desktop:col-span-9">
				<Box className="flex items-start justify-between gap-4">
					<Box>
						<Box className="text-xl">{stuffCollection.sku}</Box>

						<Box className="text-xl text-muted-foreground">
							{Beaut.money(Number(Beaut.bigint(stuffCollection.mintPriceToken, 6)))}
						</Box>
					</Box>

					<Box className="flex shrink-0 items-center gap-3">
						<Button
							className="flex size-8 items-center justify-center bg-foreground text-background"
							onClick={() => props.onRemove(cartItem)}
						>
							<Trash2 className="size-4" aria-hidden />
						</Button>
					</Box>
				</Box>

				<Box className="h-px bg-muted my-2" />

				<CartItemElement label="Author">
					<Box className="text-xs">{cartItem.author}</Box>
				</CartItemElement>

				<CartItemElement label="Title">
					<Box className="text-xs">{cartItem.title}</Box>
				</CartItemElement>

				<CartItem2Element label="Description">
					<Box className="text-xs">{cartItem.description}</Box>
				</CartItem2Element>

				<CartItem2Element label="Options">
					{cartItem.options.map((options) => {
						const option = options[0];
						const value = options[1];

						return (
							<Box key={option} className="flex gap-2 text-xs">
								<Box className="capitalize">{option}:</Box>
								<Box>{value}</Box>
							</Box>
						);
					})}{" "}
				</CartItem2Element>
			</Box>
		</Box>
	);
};

export { CartItem };

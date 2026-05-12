"use client";

import { Beaut } from "@0xhq/beaut";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import type { PropsWithChildren } from "react";
import type { StuffItem } from "@/config/types";
import { decodeCanvasToPixels, GridPreview } from "@/features/grid";
import { Box } from "@/primitives/box";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shadcn/dialog";

type AccountStuffItemFieldProps = {
	label: string;
} & PropsWithChildren;

const AccountStuffItemField = (props: AccountStuffItemFieldProps) => {
	return (
		<Box className="grid gap-0">
			<Box className="text-xs uppercase text-muted-foreground">{props.label}</Box>
			<Box className="min-w-0 wrap-break-words text-sm">{props.children}</Box>
		</Box>
	);
};

type AccountStuffItemProps = {
	stuffItem: StuffItem;
};

const AccountStuffItem = (props: AccountStuffItemProps) => {
	const stuffItem = props.stuffItem;
	const collection = stuffItem.collection;
	const pixels = decodeCanvasToPixels(stuffItem.canvas, collection.palette);
	const creationDate = new Date(Number(stuffItem.creationDate) * 1000);
	const displayTitle = stuffItem.title || `#${stuffItem.tokenId}`;
	const displayPrice = Beaut.money(Number(Beaut.bigint(collection.mintPriceToken, 6)));
	const displayCreationDate = Number.isNaN(creationDate.getTime())
		? stuffItem.creationDate.toString()
		: creationDate.toLocaleString();

	return (
		<Dialog>
			<Box className="flex items-center gap-3 border border-border bg-background p-2 desktop:gap-4">
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

				<DialogTrigger asChild>
					<button
						type="button"
						className="flex size-10 shrink-0 items-center justify-center bg-foreground text-background transition-opacity hover:opacity-90"
						aria-label={`Open details for ${displayTitle}`}
					>
						<ChevronRight className="size-5" aria-hidden />
					</button>
				</DialogTrigger>
			</Box>

			<DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{displayTitle}</DialogTitle>
					<DialogDescription>
						{collection.sku} / {displayPrice} / #{stuffItem.tokenId.toString()}
					</DialogDescription>
				</DialogHeader>

				<Box className="grid gap-4">
					<Box className="grid grid-cols-2 gap-2">
						<Box className="relative aspect-square overflow-hidden bg-muted">
							<GridPreview pixels={pixels} />
						</Box>

						<Box className="relative aspect-square overflow-hidden bg-muted">
							<Image
								fill
								className="object-cover"
								src={collection.assets.images[0]}
								alt={collection.sku}
							/>
						</Box>
					</Box>

					<Box className="grid gap-2 desktop:grid-cols-2">
						<AccountStuffItemField label="SKU">{collection.sku}</AccountStuffItemField>

						<AccountStuffItemField label="Price">{displayPrice}</AccountStuffItemField>

						<AccountStuffItemField label="Author">{stuffItem.author}</AccountStuffItemField>

						<AccountStuffItemField label="Author address">
							{stuffItem.authorAddress}
						</AccountStuffItemField>

						<AccountStuffItemField label="Owner">{stuffItem.owner}</AccountStuffItemField>

						<AccountStuffItemField label="Collection address">
							{stuffItem.stuffCollectionAddress}
						</AccountStuffItemField>

						<AccountStuffItemField label="Creation date">
							{displayCreationDate}
						</AccountStuffItemField>

						<AccountStuffItemField label="Internal id">
							{stuffItem.tokenId.toString()}
						</AccountStuffItemField>
					</Box>

					<AccountStuffItemField label="Description">
						{stuffItem.description || "-"}
					</AccountStuffItemField>

					<AccountStuffItemField label="Options">
						<Box className="grid gap-1">
							{stuffItem.options.length > 0 ? (
								stuffItem.options.map(([name, value]) => (
									<Box key={name} className="flex gap-2 text-sm">
										<Box className="capitalize text-muted-foreground">{name}:</Box>
										<Box>{value}</Box>
									</Box>
								))
							) : (
								<Box>-</Box>
							)}
						</Box>
					</AccountStuffItemField>
				</Box>
			</DialogContent>
		</Dialog>
	);
};

export { AccountStuffItem };

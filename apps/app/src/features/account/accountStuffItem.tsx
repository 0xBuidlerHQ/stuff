import { Beaut } from "@0xhq/beaut";
import Image from "next/image";
import type { PropsWithChildren } from "react";
import type { StuffItem } from "@/config/types";
import { decodeCanvasToPixels, GridPreview } from "@/features/grid";
import { Box } from "@/primitives/box";

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

	return (
		<Box className="grid border border-border bg-background desktop:grid-cols-12">
			<Box className="relative desktop:col-span-4">
				<Box className="relative aspect-square overflow-hidden bg-muted">
					<GridPreview pixels={pixels} />
				</Box>

				<Box className="absolute right-0 bottom-0 aspect-square w-16 overflow-hidden border border-border bg-muted desktop:w-20">
					<Image
						fill
						className="object-cover"
						src={collection.assets.images[0]}
						alt={collection.sku}
					/>
				</Box>
			</Box>

			<Box className="grid min-w-0 gap-4 p-4 desktop:col-span-8">
				<Box className="flex flex-wrap items-start justify-between gap-4">
					<Box className="min-w-0">
						<Box className="text-xl">{stuffItem.title || `#${stuffItem.tokenId}`}</Box>
						<Box className="text-sm text-muted-foreground">{collection.sku}</Box>
					</Box>

					<Box className="text-right text-sm">
						<Box>{Beaut.money(Number(Beaut.bigint(collection.mintPriceToken, 6)))}</Box>
						<Box className="text-muted-foreground">#{stuffItem.tokenId.toString()}</Box>
					</Box>
				</Box>

				<Box className="grid gap-2 desktop:grid-cols-2">
					<AccountStuffItemField label="Author">{stuffItem.author}</AccountStuffItemField>

					<AccountStuffItemField label="Author address">
						{stuffItem.authorAddress}
					</AccountStuffItemField>

					<AccountStuffItemField label="Owner">{stuffItem.owner}</AccountStuffItemField>

					<AccountStuffItemField label="Collection address">
						{stuffItem.stuffCollectionAddress}
					</AccountStuffItemField>

					<AccountStuffItemField label="Creation date">
						{Number.isNaN(creationDate.getTime())
							? stuffItem.creationDate.toString()
							: creationDate.toLocaleString()}
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
		</Box>
	);
};

export { AccountStuffItem };

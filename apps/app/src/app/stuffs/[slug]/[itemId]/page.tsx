import { Beaut } from "@0xhq/beaut";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { PropsWithChildren } from "react";
import { StuffItemCanvasPreview } from "@/features/stuff/stuffItemCanvasPreview";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";
import { getStuffItemBySlugAndId } from "@/queries/getStuffItemBySlugAndId";

export const dynamic = "force-dynamic";

type FieldProps = {
	label: string;
} & PropsWithChildren;

const Field = (props: FieldProps) => {
	return (
		<Box className="grid gap-1">
			<Box className="text-xs uppercase text-muted-foreground">{props.label}</Box>
			<Box className="min-w-0 wrap-break-words text-sm">{props.children}</Box>
		</Box>
	);
};

const Page = async ({ params }: { params: Promise<{ slug: string; itemId: string }> }) => {
	const { slug, itemId } = await params;
	const stuffItem = await getStuffItemBySlugAndId({ slug, itemId });

	if (!stuffItem) notFound();

	const collection = stuffItem.collection;
	const creationDate = new Date(Number(stuffItem.creationDate) * 1000);
	const displayCreationDate = Number.isNaN(creationDate.getTime())
		? stuffItem.creationDate.toString()
		: creationDate.toLocaleString();
	const displayTitle = stuffItem.title || `#${stuffItem.tokenId}`;
	const displayPrice = Beaut.money(Number(Beaut.bigint(collection.mintPriceToken, 6)));

	return (
		<Container>
			<Box className="grid gap-6">
				<Box className="flex flex-wrap items-end justify-between gap-4">
					<Box className="grid gap-2">
						<Link href="/account" className="text-sm text-muted-foreground hover:text-foreground">
							/account
						</Link>
						<h1 className="text-6xl mobile:text-4xl">{displayTitle}</h1>
						<Box className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
							<Box>{collection.sku}</Box>
							<Box>{displayPrice}</Box>
							<Box>#{stuffItem.tokenId.toString()}</Box>
						</Box>
					</Box>
				</Box>

				<Box className="grid gap-6 desktop:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] desktop:items-start">
					<Box className="grid grid-cols-2 gap-2">
						<Box className="relative aspect-square overflow-hidden bg-muted">
							<StuffItemCanvasPreview canvas={stuffItem.canvas} />
						</Box>

						<Box className="relative aspect-square overflow-hidden bg-muted">
							<Image
								fill
								className="object-cover"
								src={collection.assets.images[0]}
								alt={collection.sku}
								priority
							/>
						</Box>
					</Box>

					<Box className="grid gap-6 border border-border bg-background p-4">
						<Box className="grid gap-3 desktop:grid-cols-2">
							<Field label="SKU">{collection.sku}</Field>
							<Field label="Price">{displayPrice}</Field>
							<Field label="Author">{stuffItem.author}</Field>
							<Field label="Author address">{stuffItem.authorAddress}</Field>
							<Field label="Owner">{stuffItem.owner}</Field>
							<Field label="Collection address">{stuffItem.stuffCollectionAddress}</Field>
							<Field label="Creation date">{displayCreationDate}</Field>
							<Field label="Token id">{stuffItem.tokenId.toString()}</Field>
						</Box>

						<Field label="Description">{stuffItem.description || "-"}</Field>

						<Field label="Options">
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
						</Field>
					</Box>
				</Box>
			</Box>
		</Container>
	);
};

export default Page;

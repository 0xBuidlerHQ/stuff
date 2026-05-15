import { Beaut } from "@0xhq/beaut";
import { links } from "@/config/links";
import type { StuffCollection, StuffItemCart } from "@/config/types";
import { GridPreview } from "@/features/grid/gridPreview";
import { Box } from "@/primitives/box";
import { ButtonPrimary } from "@/primitives/button";
import { useStuffEcosystem } from "@/providers/stuff-ecosystem";

type OrderSummaryProps = {
	items: StuffItemCart[];
	stuffCollectionsByAddress: Map<string, StuffCollection>;
	checkoutCTA?: boolean;
};

const formatMoney = (amount: bigint) => Beaut.money(Number(Beaut.bigint(amount, 6)));

const CartWidget = (props: OrderSummaryProps) => {
	const { decodeCanvasToPixels } = useStuffEcosystem();
	const summaryItems = props.items
		.map((item) => {
			const stuffCollection = props.stuffCollectionsByAddress.get(
				item.stuffCollectionAddress.toLowerCase(),
			);

			if (!stuffCollection) return null;

			return {
				id: `${item.stuffCollectionAddress}-${item.title}-${item.author}`,
				item,
				stuffCollection,
			};
		})
		.filter((item): item is NonNullable<typeof item> => item !== null);

	const total = summaryItems.reduce(
		(amount, summaryItem) => amount + summaryItem.stuffCollection.mintPriceToken,
		BigInt(0),
	);

	return (
		<Box className="flex min-h-90 flex-col border border-border bg-background">
			<Box className="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto p-4">
				<Box className="flex items-center justify-between gap-4">
					<Box className="text-lg uppercase">Cart</Box>
					<Box className="text-sm text-muted-foreground">{summaryItems.length} item(s)</Box>
				</Box>

				<Box className="grid gap-3">
					{summaryItems.length === 0 ? (
						<Box className="text-sm text-muted-foreground">Your cart is empty.</Box>
					) : (
						summaryItems.map(({ id, item, stuffCollection }) => {
							const pixels = decodeCanvasToPixels(item.canvas);

							return (
								<Box key={id} className="grid gap-1 border-b border-border pb-3 last:border-b-0">
									<Box className="flex items-start gap-4">
										<Box>
											<GridPreview pixels={pixels} />
										</Box>

										<Box className="min-w-0 grow">
											<Box className="text-sm">{item.title || stuffCollection.sku}</Box>
											<Box className="text-xs text-muted-foreground">{stuffCollection.sku}</Box>
										</Box>

										<Box className="shrink-0 text-sm">
											{formatMoney(stuffCollection.mintPriceToken)}
										</Box>
									</Box>
								</Box>
							);
						})
					)}
				</Box>
			</Box>

			<Box className="mt-auto grid gap-4 border-t border-border p-4">
				<Box className="flex items-center justify-between gap-4">
					<Box className="text-sm text-muted-foreground">Total</Box>
					<Box className="text-2xl">{formatMoney(total)}</Box>
				</Box>

				{props.checkoutCTA && (
					<ButtonPrimary href={links.checkout.url} disabled={summaryItems.length === 0}>
						Checkout
					</ButtonPrimary>
				)}
			</Box>
		</Box>
	);
};

export { CartWidget };

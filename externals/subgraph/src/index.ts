import { ponder } from "ponder:registry";
import schema from "ponder:schema";
import { eq } from "ponder";
import type { Address } from "viem";

/**
 * @dev PantoneRegistry:PantoneCreated.
 */
ponder.on("PantoneRegistry:PantoneCreated", async ({ event, context }) => {
	await context.db.insert(schema.pantone).values({
		pantone: event.args.pantone,
		hexValue: event.args.hexValue,
		cmyk: event.args.cmyk,
	});
});

/**
 * @dev PantoneRegistry:PantoneUpdated.
 */
ponder.on("PantoneRegistry:PantoneUpdated", async ({ event, context }) => {
	await context.db.update(schema.pantone, { pantone: event.args.pantone }).set({
		hexValue: event.args.hexValue,
		cmyk: event.args.cmyk,
	});
});

/**
 * @dev StuffCollectionFactory:StuffCollectionERC721Created.
 */
ponder.on("StuffCollectionFactory:StuffCollectionERC721Created", async ({ event, context }) => {
	const options = event.args.stuffCollection.options.map((item) => [...item]);

	await context.db.insert(schema.stuffCollection).values({
		id: event.args.stuffId,
		address: event.args.stuffERC721,
		sku: event.args.stuffCollection.sku,
		category: event.args.stuffCollection.category,
		metadataURI: event.args.stuffCollection.metadataURI,
		options,
		paymentToken: event.args.stuffCollection.paymentToken,
		paymentRecipient: event.args.stuffCollection.paymentRecipient,
		maxSupply: event.args.stuffCollection.maxSupply,
		currentSupply: 0n,
		mintPriceToken: event.args.stuffCollection.mintPriceToken,
	});
});

/**
 * @dev StuffCollectionERC721:StuffItemCreated from every collection created by StuffCollectionFactory.
 */
ponder.on("StuffCollectionERC721:StuffItemCreated", async ({ event, context }) => {
	const { stuffItem } = event.args;

	const options = stuffItem.options.map((option) => [...option]);
	const canvas = [...stuffItem.canvas];

	await context.db.insert(schema.stuffItem).values({
		author: stuffItem.author,
		authorAddress: stuffItem.authorAddress,
		title: stuffItem.title,
		description: stuffItem.description,
		creationDate: stuffItem.creationDate,
		canvas,
		options: options,
		//
		stuffCollectionAddress: event.log.address,
		tokenId: event.args.tokenId,
		owner: event.args.to.toLowerCase() as Address,
	});

	const [stuffCollection] = await context.db.sql
		.select()
		.from(schema.stuffCollection)
		.where(eq(schema.stuffCollection.address, event.log.address))
		.limit(1);

	if (!stuffCollection) return;

	await context.db.update(schema.stuffCollection, { id: stuffCollection.id }).set({
		currentSupply: event.args.tokenId + 1n,
	});
});

/**
 * @dev StuffCollectionERC721:Transfer keeps mutable ERC721 ownership state fresh on the indexed item row.
 */
ponder.on("StuffCollectionERC721:Transfer", async ({ event, context }) => {
	await context.db
		.update(schema.stuffItem, {
			stuffCollectionAddress: event.log.address,
			tokenId: event.args.tokenId,
		})
		.set({
			owner: event.args.to.toLowerCase() as Address,
		});
});

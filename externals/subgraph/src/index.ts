import { ponder } from "ponder:registry";
import schema from "ponder:schema";
import { stuffCollectionErc721Abi } from "@0xhq/stuff.contracts";
import { eq } from "ponder";
import type { Address } from "viem";

/**
 * @dev StuffCollectionFactory:StuffCollectionERC721Created.
 */
ponder.on("StuffCollectionFactory:StuffCollectionERC721Created", async ({ event, context }) => {
	const palette = [...event.args.stuffCollection.palette];
	const options = event.args.stuffCollection.options.map((item) => [...item]);

	await context.db.insert(schema.stuffCollection).values({
		id: event.args.stuffId,
		address: event.args.stuffERC721,
		sku: event.args.stuffCollection.sku,
		category: event.args.stuffCollection.category,
		metadataURI: event.args.stuffCollection.metadataURI,
		palette,
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

	await context.db.insert(schema.stuffItem).values({
		id: stuffItem.id,
		author: stuffItem.author,
		authorAddress: stuffItem.authorAddress,
		title: stuffItem.title,
		description: stuffItem.description,
		creationDate: stuffItem.creationDate,
		canvas: stuffItem.canvas,
		options: options,
		//
		stuffAddress: event.log.address,
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
	const stuffItem = await context.client.readContract({
		abi: stuffCollectionErc721Abi,
		address: event.log.address,
		functionName: "getStuffItem",
		args: [event.args.tokenId],
	});

	await context.db.update(schema.stuffItem, { id: stuffItem.id }).set({
		owner: event.args.to.toLowerCase() as Address,
	});
});

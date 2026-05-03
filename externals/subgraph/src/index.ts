import { ponder } from "ponder:registry";
import schema from "ponder:schema";

/**
 * @dev StuffFactory:StuffERC721Created.
 */
ponder.on("StuffFactory:StuffERC721Created", async ({ event, context }) => {
	await context.db.insert(schema.stuffs).values({
		id: event.args.stuffERC721,
		stuffId: event.args.stuffId,
		createdAtBlock: event.block.number,
		createdAtTransaction: event.transaction.hash,
	});
});

/**
 * @dev StuffERC721:StuffCreated from every collection created by StuffFactory.
 */
ponder.on("StuffERC721:StuffCreated", async ({ event, context }) => {
	const collection = await context.db.find(schema.stuffs, { id: event.log.address });
	if (collection === null) return;

	const id = `${event.log.address}-${event.args.tokenId}`;

	await context.db
		.insert(schema.stuff)
		.values({
			id: id,
			stuffId: collection.stuffId,
			stuffERC721: event.log.address,
			tokenId: event.args.tokenId,
			authorAddress: event.args.authorAddress,
			canvasHash: event.args.canvasHash,
			createdAtBlock: event.block.number,
			createdAtTransaction: event.transaction.hash,
			updatedAtBlock: event.block.number,
			updatedAtTransaction: event.transaction.hash,
		})
		.onConflictDoUpdate({
			authorAddress: event.args.authorAddress,
			canvasHash: event.args.canvasHash,
			createdAtBlock: event.block.number,
			createdAtTransaction: event.transaction.hash,
		});
});

/**
 * @dev StuffERC721:Transfer keeps current owner fresh on each stuff row.
 */
ponder.on("StuffERC721:Transfer", async ({ event, context }) => {
	const collection = await context.db.find(schema.stuffs, { id: event.log.address });
	if (collection === null) return;

	const id = `${event.log.address}-${event.args.tokenId}`;

	await context.db
		.insert(schema.stuff)
		.values({
			id,
			stuffId: collection.stuffId,
			stuffERC721: event.log.address,
			tokenId: event.args.tokenId,
			owner: event.args.to,
			updatedAtBlock: event.block.number,
			updatedAtTransaction: event.transaction.hash,
		})
		.onConflictDoUpdate({
			owner: event.args.to,
			updatedAtBlock: event.block.number,
			updatedAtTransaction: event.transaction.hash,
		});
});

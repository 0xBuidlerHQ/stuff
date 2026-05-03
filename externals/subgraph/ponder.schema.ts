import { onchainTable } from "ponder";

const stuffs = onchainTable("stuffs", (t) => ({
	id: t.hex().primaryKey().notNull(),
	stuffId: t.bigint().notNull(),
	createdAtBlock: t.bigint().notNull(),
	createdAtTransaction: t.hex().notNull(),
}));

const stuff = onchainTable("stuff", (t) => ({
	id: t.text().primaryKey().notNull(),
	stuffId: t.bigint().notNull(),
	stuffERC721: t.hex().notNull(),
	tokenId: t.bigint().notNull(),
	owner: t.hex(),
	authorAddress: t.hex(),
	canvasHash: t.hex(),
	createdAtBlock: t.bigint(),
	createdAtTransaction: t.hex(),
	updatedAtBlock: t.bigint().notNull(),
	updatedAtTransaction: t.hex().notNull(),
}));

namespace SubgraphTypes {
	export type Stuffs = typeof stuffs.$inferSelect;
	export type Stuff = typeof stuff.$inferSelect;
}

export type { SubgraphTypes };
export { stuff, stuffs };

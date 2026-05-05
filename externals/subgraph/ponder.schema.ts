import type { StuffCollectionERC721 } from "@0xhq/stuff.contracts/types.user";
import { onchainTable } from "ponder";

type StuffCollection = StuffCollectionERC721.StuffCollection;

const stuffCollection = onchainTable("stuffCollection", (t) => ({
	id: t.bigint().primaryKey().notNull(),
	address: t.hex().notNull(),
	sku: t.text().notNull(),
	category: t.text().notNull(),
	metadataURI: t.text().notNull(),
	palette: t.jsonb().$type<string[]>().notNull(),
	options: t.jsonb().$type<string[][]>().notNull(),
	paymentToken: t.hex().notNull(),
	paymentRecipient: t.hex().notNull(),
	maxSupply: t.bigint().notNull(),
	currentSupply: t.bigint().notNull(),
	mintPriceToken: t.bigint().notNull(),
}));

const stuffItem = onchainTable("stuffItem", (t) => ({
	id: t.bigint().primaryKey().notNull(),
	stuffAddress: t.hex().notNull(),
	tokenId: t.bigint().notNull(),
	owner: t.hex().notNull(),
	author: t.text().notNull(),
	authorAddress: t.hex().notNull(),
	title: t.text().notNull(),
	description: t.text().notNull(),
	creationDate: t.bigint().notNull(),
	canvas: t.hex().notNull(),
	options: t.jsonb().$type<string[][]>().notNull(),
}));

namespace SubgraphTypes {
	export type StuffCollection = typeof stuffCollection.$inferSelect;
	export type StuffItem = typeof stuffItem.$inferSelect;
}

export type { StuffCollection, SubgraphTypes };
export { stuffCollection, stuffItem };

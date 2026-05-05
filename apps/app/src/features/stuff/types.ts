import type { StuffCollectionERC721 } from "@0xhq/stuff.contracts/types.user";
import type { Address, Hex } from "viem";
import type { StuffCollection, StuffItemMintParams } from "@/config/types";

type Stuff = StuffCollection;
type StuffAddress = StuffCollection["address"];
type StuffMinted = StuffCollectionERC721.StuffItem;
type StuffSlug = StuffCollection["slug"];
type StuffTokenId = bigint;
type StuffItem = StuffCollectionERC721.StuffItem;
type StuffItems = StuffItem[];
type StuffCartItem = StuffItemParams;

type StuffDesign = {
	size: number;
	pixels: string[];
};

type StuffItemParams = {
	stuffCollection: StuffCollection;
	author: StuffItemMintParams["author"];
	title: StuffItemMintParams["title"];
	description: StuffItemMintParams["description"];
	design: StuffDesign;
	selectedOptions: Record<string, string>;
};

type MintAuthorization = {
	from: Address;
	validAfter: bigint;
	validBefore: bigint;
	nonce: Hex;
	v: number;
	r: Hex;
	s: Hex;
};

type MintRelayRequest = {
	chainId: number;
	stuffAddress: StuffAddress;
	recipient: Address;
	mintParams: StuffItemMintParams;
	authorization: {
		from: MintAuthorization["from"];
		validAfter: string;
		validBefore: string;
		nonce: MintAuthorization["nonce"];
		v: MintAuthorization["v"];
		r: MintAuthorization["r"];
		s: MintAuthorization["s"];
	};
};

type WallPiece = {
	tokenId: StuffTokenId;
	owner: Address;
	stuff: StuffMinted;
	pixels: StuffDesign["pixels"];
};

type OwnedStuffPiece = WallPiece & {
	collection: StuffCollection;
};

export type {
	MintAuthorization,
	MintRelayRequest,
	OwnedStuffPiece,
	Stuff,
	StuffAddress,
	StuffCartItem,
	StuffCollection,
	StuffDesign,
	StuffItem,
	StuffItemMintParams,
	StuffItemParams,
	StuffItems,
	StuffMinted,
	StuffSlug,
	StuffTokenId,
	WallPiece,
};

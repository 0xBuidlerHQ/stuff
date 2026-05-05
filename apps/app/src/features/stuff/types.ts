import type { StuffCollectionERC721 } from "@0xhq/stuff.contracts/types.user";
import type { Address, Hex } from "viem";
import type { Stuff } from "@/config/types";

type StuffAddress = Stuff["address"];
type StuffCollection = Omit<Stuff, "assets" | "id" | "address" | "slug">;
type StuffMinted = StuffCollectionERC721.StuffItem;
type StuffSlug = Stuff["slug"];
type StuffTokenId = bigint;

type StuffItem = StuffCollectionERC721.StuffItem;

type StuffItems = StuffItem[];

type StuffDesign = {
	size: number;
	pixels: string[];
};

type StuffConfiguration = {
	stuff: Stuff;
	author: StuffMinted["author"];
	title: StuffMinted["title"];
	description: StuffMinted["description"];
	design: StuffDesign;
	selectedOptions: Record<string, string>;
};

type StuffCartItem = StuffConfiguration;

type StuffMintParams = {
	author: StuffConfiguration["author"];
	title: StuffConfiguration["title"];
	description: StuffConfiguration["description"];
	canvas: Hex;
	options: string[][];
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
	mintParams: StuffMintParams;
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
	collection: Stuff;
};

export type {
	MintAuthorization,
	MintRelayRequest,
	OwnedStuffPiece,
	Stuff,
	StuffAddress,
	StuffCartItem,
	StuffCollection,
	StuffConfiguration,
	StuffDesign,
	StuffItem,
	StuffItems,
	StuffMinted,
	StuffMintParams,
	StuffSlug,
	StuffTokenId,
	WallPiece,
};

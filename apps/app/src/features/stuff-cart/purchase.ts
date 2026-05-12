"use client";

import type { Address, Hex } from "viem";
import { toHex } from "viem";
import type { StuffCollection, StuffItemCart } from "@/config/types";

const erc3009MetadataAbi = [
	{
		type: "function",
		name: "name",
		stateMutability: "view",
		inputs: [],
		outputs: [{ name: "", type: "string" }],
	},
	{
		type: "function",
		name: "version",
		stateMutability: "view",
		inputs: [],
		outputs: [{ name: "", type: "string" }],
	},
	{
		type: "function",
		name: "balanceOf",
		stateMutability: "view",
		inputs: [{ name: "account", type: "address" }],
		outputs: [{ name: "", type: "uint256" }],
	},
] as const;

const receiveWithAuthorizationTypes = {
	ReceiveWithAuthorization: [
		{ name: "from", type: "address" },
		{ name: "to", type: "address" },
		{ name: "value", type: "uint256" },
		{ name: "validAfter", type: "uint256" },
		{ name: "validBefore", type: "uint256" },
		{ name: "nonce", type: "bytes32" },
	],
} as const;

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
	stuffCollectionAddress: Address;
	recipient: Address;
	mintParams: {
		author: string;
		title: string;
		description: string;
		canvas: Hex;
		options: string[][];
	}[];
	authorization: {
		from: Address;
		validAfter: string;
		validBefore: string;
		nonce: Hex;
		v: number;
		r: Hex;
		s: Hex;
	};
};

const getMintParams = (cartItem: StuffItemCart) => ({
	author: cartItem.author,
	canvas: cartItem.canvas as Hex,
	description: cartItem.description,
	options: cartItem.options,
	title: cartItem.title,
});

const getAuthorizationNonce = () => {
	const nonce = new Uint8Array(32);
	crypto.getRandomValues(nonce);

	return toHex(nonce);
};

const getReceiveWithAuthorizationMessage = ({
	from,
	stuffCollectionAddress,
	value,
}: {
	from: Address;
	stuffCollectionAddress: Address;
	value: bigint;
}) => {
	const now = BigInt(Math.floor(Date.now() / 1000));

	return {
		from,
		to: stuffCollectionAddress,
		value,
		validAfter: BigInt(0),
		validBefore: now + BigInt(60 * 60),
		nonce: getAuthorizationNonce(),
	};
};

const getMintRelayRequest = ({
	authorization,
	cartItem,
	chainId,
	owner,
	stuffCollection,
}: {
	authorization: MintAuthorization;
	cartItem: StuffItemCart;
	chainId: number;
	owner: Address;
	stuffCollection: StuffCollection;
}): MintRelayRequest => ({
	chainId,
	stuffCollectionAddress: stuffCollection.address,
	recipient: owner,
	mintParams: [getMintParams(cartItem)],
	authorization: {
		from: authorization.from,
		validAfter: authorization.validAfter.toString(),
		validBefore: authorization.validBefore.toString(),
		nonce: authorization.nonce,
		v: authorization.v,
		r: authorization.r,
		s: authorization.s,
	},
});

export type { MintAuthorization, MintRelayRequest };
export {
	erc3009MetadataAbi,
	getMintParams,
	getMintRelayRequest,
	getReceiveWithAuthorizationMessage,
	receiveWithAuthorizationTypes,
};

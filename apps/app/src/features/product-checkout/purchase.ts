"use client";

import type { Address, Hex } from "viem";
import { toHex } from "viem";
import type { ProductConfiguration } from "@/features/product-configurator/store";

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
	stuffAddress: Address;
	recipient: Address;
	mintParams: {
		author: string;
		title: string;
		description: string;
		canvas: Hex;
		options: string[][];
	};
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

const getMintCanvas = (configuration: ProductConfiguration) => {
	const paletteIndexByColor = new Map(
		configuration.collection.palette.map((color, index) => [color, index] as const),
	);
	const paletteIndexes = configuration.design.pixels.map((color) => {
		const paletteIndex = paletteIndexByColor.get(color);

		if (paletteIndex === undefined) {
			throw new Error(`Unknown palette color: ${color}`);
		}

		return paletteIndex;
	});

	return toHex(Uint8Array.from(paletteIndexes));
};

const getMintOptions = (configuration: ProductConfiguration) => {
	return configuration.collection.options.map(([name]) => {
		const value = configuration.selectedOptions[name];

		if (!value) {
			throw new Error(`Missing option value for ${name}`);
		}

		return [name, value];
	});
};

const getMintParams = (configuration: ProductConfiguration) => ({
	author: configuration.author,
	canvas: getMintCanvas(configuration),
	description: configuration.description,
	options: getMintOptions(configuration),
	title: configuration.title,
});

const getAuthorizationNonce = () => {
	const nonce = new Uint8Array(32);
	crypto.getRandomValues(nonce);

	return toHex(nonce);
};

const getReceiveWithAuthorizationMessage = ({
	from,
	stuffAddress,
	value,
}: {
	from: Address;
	stuffAddress: Address;
	value: bigint;
}) => {
	const now = BigInt(Math.floor(Date.now() / 1000));

	return {
		from,
		to: stuffAddress,
		value,
		validAfter: BigInt(0),
		validBefore: now + BigInt(60 * 60),
		nonce: getAuthorizationNonce(),
	};
};

const getMintRelayRequest = ({
	authorization,
	chainId,
	configuration,
	owner,
}: {
	authorization: MintAuthorization;
	chainId: number;
	configuration: ProductConfiguration;
	owner: Address;
}): MintRelayRequest => ({
	chainId,
	stuffAddress: configuration.stuffAddress,
	recipient: owner,
	mintParams: getMintParams(configuration),
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

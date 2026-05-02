import { NextResponse } from "next/server";
import {
	type Address,
	type Chain,
	type Hex,
	createPublicClient,
	createWalletClient,
	http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { simulateContract, waitForTransactionReceipt, writeContract } from "viem/actions";
import { anvil, base, baseSepolia } from "viem/chains";
import { env } from "@/config/env";

const mintWithAuthorizationAbi = [
	{
		type: "function",
		name: "mintWithAuthorization",
		stateMutability: "nonpayable",
		inputs: [
			{ name: "_to", type: "address" },
			{
				name: "_params",
				type: "tuple",
				components: [
					{ name: "author", type: "string" },
					{ name: "title", type: "string" },
					{ name: "description", type: "string" },
					{ name: "canvas", type: "bytes" },
					{ name: "options", type: "string[][]" },
				],
			},
			{
				name: "_authorization",
				type: "tuple",
				components: [
					{ name: "from", type: "address" },
					{ name: "validAfter", type: "uint256" },
					{ name: "validBefore", type: "uint256" },
					{ name: "nonce", type: "bytes32" },
					{ name: "v", type: "uint8" },
					{ name: "r", type: "bytes32" },
					{ name: "s", type: "bytes32" },
				],
			},
		],
		outputs: [{ name: "tokenId", type: "uint256" }],
	},
	{
		type: "function",
		name: "relayer",
		stateMutability: "view",
		inputs: [],
		outputs: [{ name: "", type: "address" }],
	},
] as const;

type MintWithAuthorizationRequest = {
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

const chainById: Record<number, Chain> = {
	[anvil.id]: anvil,
	[base.id]: base,
	[baseSepolia.id]: baseSepolia,
};

const getRpcUrl = (chainId: number) => {
	switch (chainId) {
		case anvil.id:
			return env.RPC_URL;
		case base.id:
			return env.BASE_RPC_URL;
		case baseSepolia.id:
			return env.BASE_SEPOLIA_RPC_URL;
		default:
			return undefined;
	}
};

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as MintWithAuthorizationRequest;
		const relayerPrivateKey = env.RELAYER_PRIVATE_KEY as Hex;

		const chain = chainById[body.chainId];
		const rpcUrl = getRpcUrl(body.chainId);

		if (!chain || !rpcUrl) {
			return NextResponse.json({ error: `Unsupported chain id ${body.chainId}.` }, { status: 400 });
		}

		const account = privateKeyToAccount(relayerPrivateKey);
		const transport = http(rpcUrl);
		const publicClient = createPublicClient({ chain, transport });
		const walletClient = createWalletClient({ account, chain, transport });

		const configuredRelayer = await publicClient.readContract({
			address: body.stuffAddress,
			abi: mintWithAuthorizationAbi,
			functionName: "relayer",
		});

		if (configuredRelayer.toLowerCase() !== account.address.toLowerCase()) {
			return NextResponse.json(
				{ error: "Configured relayer does not match RELAYER_PRIVATE_KEY." },
				{ status: 500 },
			);
		}

		const { request: contractRequest } = await simulateContract(publicClient, {
			address: body.stuffAddress,
			abi: mintWithAuthorizationAbi,
			functionName: "mintWithAuthorization",
			account,
			args: [
				body.recipient,
				body.mintParams,
				{
					from: body.authorization.from,
					validAfter: BigInt(body.authorization.validAfter),
					validBefore: BigInt(body.authorization.validBefore),
					nonce: body.authorization.nonce,
					v: body.authorization.v,
					r: body.authorization.r,
					s: body.authorization.s,
				},
			],
		});

		const hash = await writeContract(walletClient, contractRequest);
		const receipt = await waitForTransactionReceipt(publicClient, { hash });

		return NextResponse.json({
			transactionHash: receipt.transactionHash,
		});
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Mint relay failed." },
			{ status: 500 },
		);
	}
}

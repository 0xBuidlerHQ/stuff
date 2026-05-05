"use client";

import { useState } from "react";
import type { Address } from "viem";
import { parseSignature } from "viem";
import { useConfig, useWalletClient } from "wagmi";
import { readContract } from "wagmi/actions";
import type { StuffItemParams } from "@/features/stuff/types";
import { useWeb3 } from "@/providers/web3";
import {
	erc3009MetadataAbi,
	getMintRelayRequest,
	getReceiveWithAuthorizationMessage,
	receiveWithAuthorizationTypes,
} from "./purchase";

const useStuffPurchase = (
	configuration?: StuffItemParams,
	options?: { onSuccess?: () => void },
) => {
	const config = useConfig();
	const { connect, eoa, isConnected } = useWeb3();
	const { data: walletClient } = useWalletClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	const pay = async () => {
		if (!configuration) return;

		if (!isConnected || !eoa.address) {
			connect();
			return;
		}

		if (!walletClient) {
			setErrorMessage("Wallet client unavailable.");
			return;
		}

		if (!eoa.chain?.id) {
			setErrorMessage("Unsupported network.");
			return;
		}

		try {
			setIsPending(true);
			setErrorMessage(null);

			const owner = eoa.address as Address;
			const paymentToken = configuration.stuffCollection.paymentToken as Address;
			const [name, version, balance] = await Promise.all([
				readContract(config, {
					abi: erc3009MetadataAbi,
					address: paymentToken,
					functionName: "name",
				}),
				readContract(config, {
					abi: erc3009MetadataAbi,
					address: paymentToken,
					functionName: "version",
				}),
				readContract(config, {
					abi: erc3009MetadataAbi,
					address: paymentToken,
					functionName: "balanceOf",
					args: [owner],
				}),
			]);

			if (balance < configuration.stuffCollection.mintPriceToken) {
				throw new Error("Insufficient USDC balance for this mint.");
			}

			const message = getReceiveWithAuthorizationMessage({
				from: owner,
				stuffAddress: configuration.stuffCollection.address,
				value: configuration.stuffCollection.mintPriceToken,
			});

			const signature = await walletClient.signTypedData({
				account: owner,
				domain: {
					name,
					version,
					chainId: eoa.chain.id,
					verifyingContract: paymentToken,
				},
				primaryType: "ReceiveWithAuthorization",
				types: receiveWithAuthorizationTypes,
				message,
			});

			const parsedSignature = parseSignature(signature);
			const v = Number(parsedSignature.v ?? BigInt(parsedSignature.yParity + 27));

			const response = await fetch("/api/mint-with-authorization", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(
					getMintRelayRequest({
						authorization: {
							from: owner,
							validAfter: message.validAfter,
							validBefore: message.validBefore,
							nonce: message.nonce,
							v,
							r: parsedSignature.r,
							s: parsedSignature.s,
						},
						chainId: eoa.chain.id,
						configuration,
						owner,
					}),
				),
			});

			if (!response.ok) {
				const body = (await response.json().catch(() => null)) as { error?: string } | null;
				throw new Error(body?.error || "Relay failed");
			}

			options?.onSuccess?.();
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : "Purchase failed");
		} finally {
			setIsPending(false);
		}
	};

	const label = !isConnected ? "LOG IN TO PAY" : isPending ? "SIGN TO PAY" : "PAY";

	return {
		errorMessage,
		isPending,
		label,
		pay,
	};
};

export { useStuffPurchase };

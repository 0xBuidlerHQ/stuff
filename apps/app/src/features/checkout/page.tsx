"use client";

import { Beaut } from "@0xhq/beaut";
import { useForm } from "@tanstack/react-form";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Address } from "viem";
import { parseSignature } from "viem";
import { useConfig, useWalletClient } from "wagmi";
import { readContract } from "wagmi/actions";
import type { StuffCollection } from "@/config/types";
import { CartWidget } from "@/features/cart/cartWidget";
import { useCartStore } from "@/features/cart/store";
import {
	erc3009MetadataAbi,
	getReceiveWithAuthorizationMessage,
	receiveWithAuthorizationTypes,
} from "@/features/stuff-cart/purchase";
import { Box } from "@/primitives/box";
import { ButtonPrimary } from "@/primitives/button";
import { useWeb3 } from "@/providers/web3";
import { cn } from "@/utils";

type CheckoutPageProps = {
	stuffCollections: StuffCollection[];
};

type CheckoutValues = {
	address: string;
	city: string;
	email: string;
	fullName: string;
	phone: string;
	postalCode: string;
};

type GlsPickupPoint = {
	id: string;
	name: string;
	address: string;
	city: string;
	postalCode: string;
	distanceKm: number;
	openingHours: string;
	keywords: string[];
};

const glsPickupPoints: GlsPickupPoint[] = [
	{
		address: "Av. da Republica 45",
		city: "Lisboa",
		distanceKm: 1.2,
		id: "gls-lisboa-saldanha",
		keywords: ["lisboa", "lisbon", "saldanha", "1000", "1050"],
		name: "GLS ParcelShop Saldanha",
		openingHours: "Mon-Fri 09:00-19:00",
		postalCode: "1050-188",
	},
	{
		address: "Rua do Ouro 112",
		city: "Lisboa",
		distanceKm: 2.1,
		id: "gls-lisboa-baixa",
		keywords: ["lisboa", "lisbon", "baixa", "1100", "1200"],
		name: "GLS ParcelShop Baixa",
		openingHours: "Mon-Sat 10:00-20:00",
		postalCode: "1100-063",
	},
	{
		address: "Rua de Santa Catarina 389",
		city: "Porto",
		distanceKm: 1.5,
		id: "gls-porto-santa-catarina",
		keywords: ["porto", "4000", "bonfim", "santa catarina"],
		name: "GLS ParcelShop Santa Catarina",
		openingHours: "Mon-Fri 09:30-19:00",
		postalCode: "4000-451",
	},
	{
		address: "Av. da Boavista 1203",
		city: "Porto",
		distanceKm: 2.7,
		id: "gls-porto-boavista",
		keywords: ["porto", "boavista", "4100"],
		name: "GLS ParcelShop Boavista",
		openingHours: "Mon-Sat 10:00-19:30",
		postalCode: "4100-130",
	},
	{
		address: "Rua Ferreira Borges 52",
		city: "Coimbra",
		distanceKm: 1.8,
		id: "gls-coimbra-centro",
		keywords: ["coimbra", "3000", "centro"],
		name: "GLS ParcelShop Coimbra Centro",
		openingHours: "Mon-Fri 09:00-18:30",
		postalCode: "3000-179",
	},
	{
		address: "Rua de Santo Antonio 32",
		city: "Faro",
		distanceKm: 1.9,
		id: "gls-faro-centro",
		keywords: ["faro", "8000", "algarve"],
		name: "GLS ParcelShop Faro Centro",
		openingHours: "Mon-Fri 09:00-18:00",
		postalCode: "8000-283",
	},
];

const formatMoney = (amount: bigint) => Beaut.money(Number(Beaut.bigint(amount, 6)));

const rankPickupPoints = (query: string) => {
	const normalizedQuery = query.trim().toLowerCase();

	if (!normalizedQuery) {
		return glsPickupPoints.slice(0, 3);
	}

	return glsPickupPoints
		.map((point) => {
			const haystack = [point.name, point.address, point.city, point.postalCode, ...point.keywords]
				.join(" ")
				.toLowerCase();
			const matchPenalty = haystack.includes(normalizedQuery)
				? 0
				: point.keywords.some((keyword) => normalizedQuery.includes(keyword))
					? 0.4
					: 3;

			return {
				...point,
				distanceKm: point.distanceKm + matchPenalty,
			};
		})
		.sort((first, second) => first.distanceKm - second.distanceKm)
		.slice(0, 3);
};

const CheckoutField = ({ children, label }: { children: React.ReactNode; label: string }) => {
	return (
		<Box className="grid gap-2">
			<Box className="text-xs uppercase text-muted-foreground">{label}</Box>
			{children}
		</Box>
	);
};

const inputClassName =
	"h-10 w-full border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground";

const CheckoutPage = (props: CheckoutPageProps) => {
	const config = useConfig();
	const cartStore = useCartStore();
	const { connect, eoa, isConnected } = useWeb3();
	const { data: walletClient } = useWalletClient();
	const [pickupSearch, setPickupSearch] = useState("");
	const [selectedPickupPointId, setSelectedPickupPointId] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

	const stuffCollectionsByAddress = useMemo(
		() =>
			new Map(
				props.stuffCollections.map((stuffCollection) => [
					stuffCollection.address.toLowerCase(),
					stuffCollection,
				]),
			),
		[props.stuffCollections],
	);

	const summaryItems = cartStore.items
		.map((item) => {
			const stuffCollection = stuffCollectionsByAddress.get(
				item.stuffCollectionAddress.toLowerCase(),
			);

			if (!stuffCollection) return null;

			return {
				id: `${item.stuffCollectionAddress}-${item.title}-${item.author}`,
				item,
				stuffCollection,
			};
		})
		.filter((item): item is NonNullable<typeof item> => item !== null);
	const total = summaryItems.reduce(
		(amount, summaryItem) => amount + summaryItem.stuffCollection.mintPriceToken,
		BigInt(0),
	);
	const pickupPoints = rankPickupPoints(pickupSearch);
	const selectedPickupPoint = glsPickupPoints.find((point) => point.id === selectedPickupPointId);

	const form = useForm({
		defaultValues: {
			address: "",
			city: "",
			email: "",
			fullName: "",
			phone: "",
			postalCode: "",
		} satisfies CheckoutValues,
		onSubmit: async ({ value }) => {
			if (!selectedPickupPoint) {
				setSubmittedMessage("Select a GLS pickup point before continuing.");
				return;
			}

			if (summaryItems.length === 0) {
				setSubmittedMessage("Your cart is empty.");
				return;
			}

			if (!isConnected || !eoa.address) {
				connect();
				return;
			}

			if (!walletClient) {
				setSubmittedMessage("Wallet client unavailable.");
				return;
			}

			if (!eoa.chain?.id) {
				setSubmittedMessage("Unsupported network.");
				return;
			}

			try {
				setIsSubmitting(true);
				setSubmittedMessage("Waiting for signature.");

				const owner = eoa.address as Address;
				const [firstSummaryItem] = summaryItems;
				const firstStuffCollection = firstSummaryItem.stuffCollection;
				const hasMultipleCollections = summaryItems.some(
					({ stuffCollection }) =>
						stuffCollection.address.toLowerCase() !== firstStuffCollection.address.toLowerCase(),
				);

				if (hasMultipleCollections) {
					throw new Error("One-payment checkout requires all items to be from the same collection.");
				}

				const paymentToken = firstStuffCollection.paymentToken as Address;
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

				if (balance < total) {
					throw new Error(`Insufficient USDC balance for ${formatMoney(total)} checkout.`);
				}

				const message = getReceiveWithAuthorizationMessage({
					from: owner,
					stuffCollectionAddress: firstStuffCollection.address,
					value: total,
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

				setSubmittedMessage(`Minting ${summaryItems.length} item(s).`);

				const response = await fetch("/api/mint-with-authorization", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						chainId: eoa.chain.id,
						stuffCollectionAddress: firstStuffCollection.address,
						recipient: owner,
						mintParams: summaryItems.map(({ item }) => ({
							author: item.author,
							canvas: item.canvas,
							description: item.description,
							options: item.options,
							title: item.title,
						})),
						authorization: {
							from: owner,
							validAfter: message.validAfter.toString(),
							validBefore: message.validBefore.toString(),
							nonce: message.nonce,
							v,
							r: parsedSignature.r,
							s: parsedSignature.s,
						},
					}),
				});

				if (!response.ok) {
					const body = (await response.json().catch(() => null)) as { error?: string } | null;
					throw new Error(body?.error || "Relay failed");
				}

				cartStore.clearItems();
				setSubmittedMessage(
					`Minted ${summaryItems.length} item(s) for ${value.fullName || "customer"} at ${
						selectedPickupPoint.name
					}.`,
				);
			} catch (error) {
				setSubmittedMessage(error instanceof Error ? error.message : "Checkout failed.");
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	return (
		<Box className="grid gap-6 desktop:grid-cols-12 desktop:items-start">
			<Box className="grid gap-6 desktop:col-span-8">
				<form
					className="grid gap-6"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						form.handleSubmit();
					}}
				>
					<Box className="grid gap-4 border border-border bg-background p-4">
						<Box className="text-lg uppercase">Contact</Box>

						<Box className="grid gap-4 desktop:grid-cols-2">
							<form.Field name="fullName">
								{(field) => (
									<CheckoutField label="Full name">
										<input
											className={inputClassName}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) => field.handleChange(event.target.value)}
										/>
									</CheckoutField>
								)}
							</form.Field>

							<form.Field name="email">
								{(field) => (
									<CheckoutField label="Email">
										<input
											className={inputClassName}
											name={field.name}
											type="email"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) => field.handleChange(event.target.value)}
										/>
									</CheckoutField>
								)}
							</form.Field>

							<form.Field name="phone">
								{(field) => (
									<CheckoutField label="Phone">
										<input
											className={inputClassName}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) => field.handleChange(event.target.value)}
										/>
									</CheckoutField>
								)}
							</form.Field>
						</Box>
					</Box>

					<Box className="grid gap-4 border border-border bg-background p-4">
						<Box className="text-lg uppercase">Delivery address</Box>

						<form.Field name="address">
							{(field) => (
								<CheckoutField label="Address">
									<input
										className={inputClassName}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => {
											field.handleChange(event.target.value);
											setPickupSearch(event.target.value);
										}}
									/>
								</CheckoutField>
							)}
						</form.Field>

						<Box className="grid gap-4 desktop:grid-cols-2">
							<form.Field name="city">
								{(field) => (
									<CheckoutField label="City">
										<input
											className={inputClassName}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) => {
												field.handleChange(event.target.value);
												setPickupSearch(`${pickupSearch} ${event.target.value}`);
											}}
										/>
									</CheckoutField>
								)}
							</form.Field>

							<form.Field name="postalCode">
								{(field) => (
									<CheckoutField label="Postal code">
										<input
											className={inputClassName}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) => {
												field.handleChange(event.target.value);
												setPickupSearch(`${pickupSearch} ${event.target.value}`);
											}}
										/>
									</CheckoutField>
								)}
							</form.Field>
						</Box>
					</Box>

					<Box className="grid gap-4 border border-border bg-background p-4">
						<Box className="flex flex-wrap items-center justify-between gap-3">
							<Box className="text-lg uppercase">GLS pickup point</Box>

							<Box className="flex min-w-64 items-center gap-2 border border-border px-3">
								<Search className="size-4 text-muted-foreground" aria-hidden />
								<input
									className="h-10 min-w-0 flex-1 bg-background text-sm outline-none placeholder:text-muted-foreground"
									placeholder="Search by address, city, or postal code"
									value={pickupSearch}
									onChange={(event) => setPickupSearch(event.target.value)}
								/>
							</Box>
						</Box>

						<Box className="grid gap-3">
							{pickupPoints.map((point) => {
								const isSelected = selectedPickupPointId === point.id;

								return (
									<button
										key={point.id}
										type="button"
										className={cn(
											"grid gap-2 border p-4 text-left transition",
											isSelected
												? "border-foreground bg-foreground text-background"
												: "border-border bg-background hover:bg-muted",
										)}
										onClick={() => setSelectedPickupPointId(point.id)}
									>
										<Box className="flex items-start justify-between gap-4">
											<Box>
												<Box className="text-sm">{point.name}</Box>
												<Box
													className={cn(
														"text-xs",
														isSelected ? "text-background/70" : "text-muted-foreground",
													)}
												>
													{point.address}, {point.postalCode} {point.city}
												</Box>
											</Box>

											<Box className="shrink-0 text-sm">{point.distanceKm.toFixed(1)} km</Box>
										</Box>

										<Box
											className={cn(
												"text-xs",
												isSelected ? "text-background/70" : "text-muted-foreground",
											)}
										>
											{point.openingHours}
										</Box>
									</button>
								);
							})}
						</Box>
					</Box>

					<ButtonPrimary
						type="submit"
						disabled={summaryItems.length === 0 || isSubmitting}
						className="flex w-full justify-center"
					>
						{isSubmitting ? "Minting" : "Continue"}
					</ButtonPrimary>

					{submittedMessage && (
						<Box className="text-sm text-muted-foreground">{submittedMessage}</Box>
					)}
				</form>
			</Box>

			<Box className="desktop:sticky desktop:top-2 desktop:col-span-4 desktop:self-start">
				<CartWidget items={cartStore.items} stuffCollectionsByAddress={stuffCollectionsByAddress} />
			</Box>
		</Box>
	);
};

export { CheckoutPage };

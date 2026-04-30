"use client";

import { Beaut } from "@0xhq/beaut";
import { ierc1363Abi, stuffErc721Config } from "@0xhq/stuff.contracts";
import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";
import { type Address, toHex } from "viem";
import { useConfig } from "wagmi";
import { readContract, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { getProductAssets } from "@/assets";
import { GridPreview } from "@/features/product-configurator/grid";
import {
	type ProductConfiguration,
	useProductConfiguratorStore,
} from "@/features/product-configurator/store";
import { Box } from "@/primitives/box";
import { ButtonPrimary } from "@/primitives/button";
import { Container } from "@/primitives/container";
import { useWeb3 } from "@/providers/web3";
import { Drawer, DrawerContent, DrawerTitle } from "@/shadcn/drawer";
import { useProductCheckoutStore } from "./store";

type ConfigurationProps = {
	configuration?: ProductConfiguration;
};

type DetailFieldProps = {
	label: string;
	children: ReactNode;
};

const DetailField = ({ label, children }: DetailFieldProps) => {
	return (
		<Box className="grid gap-1">
			<Box className="text-xs font-unbounded">{label}</Box>
			<Box>{children}</Box>
		</Box>
	);
};

const CheckoutDetails = ({ configuration }: ConfigurationProps) => {
	const optionEntries = Object.entries(configuration?.selectedOptions ?? {});

	return (
		<Box className="grid gap-4">
			<DetailField label="SKU">
				<Box className="text-xl text-muted-foreground">{configuration?.sku || "-"}</Box>
			</DetailField>

			<DetailField label="Author">
				<Box className="text-base text-muted-foreground">{configuration?.author || "-"}</Box>
			</DetailField>

			<DetailField label="Title">
				<Box className="text-base text-muted-foreground">{configuration?.title || "-"}</Box>
			</DetailField>

			<DetailField label="Description">
				<Box className="text-xs text-muted-foreground">{configuration?.description || "-"}</Box>
			</DetailField>

			<DetailField label="Options">
				<Box className="grid gap-2">
					{optionEntries.map(([name, value]) => (
						<Box key={name} className="flex items-center gap-4 pb-2">
							<Box className="capitalize text-xs font-unbounded text-muted-foreground">
								{`///// ${name} /////`}
							</Box>

							<Box className="w-4 flex items-center justify-center">
								<Box className="h-4 w-px bg-muted-foreground" />
							</Box>

							<Box className="text-base">{value}</Box>
						</Box>
					))}
				</Box>
			</DetailField>
		</Box>
	);
};

const ProductImagePreview = ({ configuration }: ConfigurationProps) => {
	const productAssets = configuration?.sku ? getProductAssets(configuration.sku) : undefined;
	const productImage = productAssets?.images[0];

	if (!productImage) return null;

	return (
		<Box className="relative aspect-square w-full overflow-hidden border border-muted bg-background desktop:h-full desktop:w-auto">
			<Image
				fill
				className="object-cover"
				src={productImage}
				alt={configuration?.sku ?? "Product"}
				sizes="(min-width: 1024px) 30vw, 100vw"
			/>
		</Box>
	);
};

const DesignPreview = ({ configuration }: ConfigurationProps) => {
	if (!configuration?.design) return null;

	return (
		<Box className="aspect-square w-full desktop:h-full desktop:w-auto">
			<GridPreview
				size={configuration.design.size}
				pixels={configuration.design.pixels}
				className="desktop:h-full desktop:w-auto"
			/>
		</Box>
	);
};

const CheckoutVisuals = ({ configuration }: ConfigurationProps) => {
	return (
		<Box className="grid gap-4 desktop:flex desktop:h-full desktop:min-h-0 desktop:justify-end">
			<ProductImagePreview configuration={configuration} />
			<DesignPreview configuration={configuration} />
		</Box>
	);
};

const CheckoutPaymentInfo = ({ configuration }: ConfigurationProps) => {
	return (
		<Box className="py-4">
			<Box className="text-4xl">
				{Beaut.money(Number(Beaut.bigint(configuration?.collection.mintPriceToken, 6)))}
			</Box>
		</Box>
	);
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

const CTA = ({ configuration }: ConfigurationProps) => {
	const config = useConfig();
	const productCheckoutStore = useProductCheckoutStore();
	const { connect, eoa, isConnected } = useWeb3();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);
	const [phase, setPhase] = useState<"idle" | "approving" | "minting">("idle");

	const pay = async () => {
		if (!configuration) {
			return;
		}

		if (!isConnected || !eoa.address) {
			connect();
			return;
		}

		try {
			setIsPending(true);
			setErrorMessage(null);

			const owner = eoa.address as Address;
			const spender = configuration.stuffAddress;
			const paymentToken = configuration.collection.paymentToken as Address;
			const mintPriceToken = configuration.collection.mintPriceToken;
			const allowance = (await readContract(config, {
				abi: ierc1363Abi,
				address: paymentToken,
				functionName: "allowance",
				args: [owner, spender],
			})) as bigint;

			if (allowance < mintPriceToken) {
				setPhase("approving");
				const approvalHash = await writeContract(config, {
					abi: ierc1363Abi,
					address: paymentToken,
					functionName: "approve",
					args: [spender, mintPriceToken],
				});

				await waitForTransactionReceipt(config, { hash: approvalHash });
			}

			setPhase("minting");
			const mintHash = await writeContract(config, {
				abi: stuffErc721Config.abi,
				address: configuration.stuffAddress,
				functionName: "mint",
				args: [
					owner,
					{
						author: configuration.author,
						canvas: getMintCanvas(configuration),
						description: configuration.description,
						options: getMintOptions(configuration),
						title: configuration.title,
					},
				],
			});

			await waitForTransactionReceipt(config, { hash: mintHash });
			productCheckoutStore.closeCheckoutDrawer();
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : "Mint failed");
		} finally {
			setIsPending(false);
			setPhase("idle");
		}
	};

	const label = !isConnected
		? "LOG IN TO PAY"
		: phase === "approving"
			? "APPROVING"
			: phase === "minting"
				? "MINTING"
				: "PAY";

	return (
		<Box className="py-2 grid gap-2">
			<ButtonPrimary onClick={pay} disabled={!configuration || isPending} className="w-full">
				<Box className="text-2xl">{label}</Box>
			</ButtonPrimary>

			{errorMessage ? <Box className="text-xs text-red-500">{errorMessage}</Box> : null}
		</Box>
	);
};

const Content = () => {
	const productCheckoutStore = useProductCheckoutStore();
	const configuration = useProductConfiguratorStore((state) =>
		productCheckoutStore.checkoutSku
			? state.configurationsBySku[productCheckoutStore.checkoutSku]
			: undefined,
	);

	return (
		<Box className="px-4 flex flex-col">
			<h1 className="text-6xl font-bold py-2">Checkout</h1>

			<Box className="h-px bg-muted" />

			<Box className="grid gap-8 desktop:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] desktop:items-stretch py-4">
				<CheckoutDetails configuration={configuration} />
				<CheckoutVisuals configuration={configuration} />
			</Box>

			<Box className="h-px bg-muted" />

			<CheckoutPaymentInfo configuration={configuration} />
		</Box>
	);
};

const CheckoutDrawer = () => {
	const productCheckoutStore = useProductCheckoutStore();
	const configuration = useProductConfiguratorStore((state) =>
		productCheckoutStore.checkoutSku
			? state.configurationsBySku[productCheckoutStore.checkoutSku]
			: undefined,
	);

	return (
		<Drawer
			open={productCheckoutStore.checkoutDrawerOpen}
			onOpenChange={productCheckoutStore.closeCheckoutDrawer}
		>
			<DrawerContent className="bg-white text-black">
				<Container className="overflow-y-auto">
					<DrawerTitle className="hidden">Checkout</DrawerTitle>

					<Content />
					<CTA configuration={configuration} />
				</Container>
			</DrawerContent>
		</Drawer>
	);
};

export { CheckoutDrawer };

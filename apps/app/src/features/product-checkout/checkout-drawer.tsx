"use client";

import { Beaut } from "@0xhq/beaut";
import Image from "next/image";
import type { ReactNode } from "react";
import { getProductAssets } from "@/assets";
import { GridPreview } from "@/features/product-configurator/grid";
import {
	type ProductConfiguration,
	useProductConfiguratorStore,
} from "@/features/product-configurator/store";
import { Box } from "@/primitives/box";
import { ButtonPrimary } from "@/primitives/button";
import { Container } from "@/primitives/container";
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
			<Box className="text-sm uppercase text-muted-foreground">{label}</Box>
			<Box>{children}</Box>
		</Box>
	);
};

const CheckoutDetails = ({ configuration }: ConfigurationProps) => {
	const optionEntries = Object.entries(configuration?.selectedOptions ?? {});

	return (
		<Box className="grid gap-4">
			<DetailField label="SKU">
				<Box className="text-2xl">{configuration?.sku || "-"}</Box>
			</DetailField>

			<DetailField label="Author">
				<Box className="text-base">{configuration?.author || "-"}</Box>
			</DetailField>

			<DetailField label="Title">
				<Box className="text-base">{configuration?.title || "-"}</Box>
			</DetailField>

			<DetailField label="Description">
				<Box className="text-base">{configuration?.description || "-"}</Box>
			</DetailField>

			<DetailField label="Options">
				<Box className="grid gap-2">
					{optionEntries.map(([name, value]) => (
						<Box key={name} className="flex gap-4 pb-2">
							<Box className="capitalize text-muted-foreground">{name}</Box>
							<Box className="">{value}</Box>
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

			<CheckoutPaymentInfo />
		</Box>
	);
};

const CTA = () => {
	return (
		<Box className="py-2">
			<ButtonPrimary className="w-full">
				<Box className="text-2xl">PAY</Box>
			</ButtonPrimary>
		</Box>
	);
};

const CheckoutDrawer = () => {
	const productCheckoutStore = useProductCheckoutStore();

	return (
		<Drawer
			open={productCheckoutStore.checkoutDrawerOpen}
			onOpenChange={productCheckoutStore.closeCheckoutDrawer}
		>
			<DrawerContent className="bg-white text-black">
				<Container className="overflow-y-auto">
					<DrawerTitle className="hidden">Checkout</DrawerTitle>

					<Content />
					<CTA />
				</Container>
			</DrawerContent>
		</Drawer>
	);
};

export { CheckoutDrawer };

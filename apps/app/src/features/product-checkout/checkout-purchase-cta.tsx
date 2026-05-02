"use client";

import { Box } from "@/primitives/box";
import { ButtonPrimary } from "@/primitives/button";
import type { ProductConfiguration } from "../product-configurator/store";
import { useProductPurchase } from "./use-product-purchase";

type CheckoutPurchaseCtaProps = {
	configuration?: ProductConfiguration;
};

const CheckoutPurchaseCta = ({ configuration }: CheckoutPurchaseCtaProps) => {
	const { errorMessage, isPending, label, pay } = useProductPurchase(configuration);

	return (
		<Box className="py-2 grid gap-2">
			<ButtonPrimary onClick={pay} disabled={!configuration || isPending} className="w-full">
				<Box className="text-2xl">{label}</Box>
			</ButtonPrimary>

			{errorMessage ? <Box className="text-xs text-red-500">{errorMessage}</Box> : null}
		</Box>
	);
};

export { CheckoutPurchaseCta };

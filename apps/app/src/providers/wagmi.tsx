"use client";

import type { PropsWithChildren } from "react";
import React from "react";
import { WagmiProvider as WagmiProviderPrimitive } from "wagmi";
import { wagmiConfig } from "@/providers/wagmi.config";

type WagmiProviderProps = PropsWithChildren & {
	initialState: React.ComponentProps<typeof WagmiProviderPrimitive>["initialState"];
};
const WagmiProvider = (props: WagmiProviderProps) => {
	const [config] = React.useState(() => wagmiConfig());

	return (
		<WagmiProviderPrimitive config={config} initialState={props.initialState}>
			{props.children}
		</WagmiProviderPrimitive>
	);
};

export { WagmiProvider, type WagmiProviderProps };

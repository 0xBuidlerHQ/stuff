import type { PropsWithChildren } from "react";
import { QueryProvider } from "@/providers/query";
import { WagmiProvider, type WagmiProviderProps } from "@/providers/wagmi";
import { Web3Provider } from "@/providers/web3";

/**
 * @dev Layout Providers.
 */
const LayoutProviders = ({ children }: PropsWithChildren) => {
	return <>{children}</>;
};

/**
 * @dev Layout Providers.
 */
const LogicProviders = ({ children, initialState }: PropsWithChildren & WagmiProviderProps) => {
	return (
		<QueryProvider>
			<WagmiProvider initialState={initialState}>
				<Web3Provider>{children}</Web3Provider>
			</WagmiProvider>
		</QueryProvider>
	);
};

/**
 * @dev Providers.
 */
const Providers = ({ children, initialState }: PropsWithChildren & WagmiProviderProps) => {
	return (
		<LayoutProviders>
			<LogicProviders initialState={initialState}>{children}</LogicProviders>
		</LayoutProviders>
	);
};

export { Providers };

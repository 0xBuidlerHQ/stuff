import type { Address } from "viem";
import { cookieStorage, createConfig, createStorage, http } from "wagmi";

import { anvil as anvilPrimitive } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const anvil = {
	...anvilPrimitive,

	contracts: {
		multicall3: {
			address: "0xcA11bde05977b3631167028862bE2a173976CA11" as Address,
			blockCreated: 0,
		},
	},
};

const wagmiConfig = () =>
	createConfig({
		chains: [anvil],
		ssr: true,
		transports: {
			[anvil.id]: http(),
		},
		connectors: [injected()],
		storage: createStorage({ storage: cookieStorage }),
	});

export { wagmiConfig };

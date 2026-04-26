"use client";

import React from "react";

import {
	injected,
	useChains,
	useClient,
	useConnect,
	useConnection,
	useConnectors,
	useDisconnect,
	usePublicClient,
	useSwitchChain,
} from "wagmi";

/**
 * @dev useWeb3 hook.
 */
const useWeb3Primitive = () => {
	/**
	 *
	 * @dev Viem.
	 *
	 */
	const client = useClient();
	const publicClient = usePublicClient();

	/**
	 *
	 * @dev EOA.
	 *
	 */
	const eoa = useConnection();

	/**
	 *
	 * @dev Connectors.
	 *
	 */
	const connectors = useConnectors();
	const portoConnector = connectors.find((connector) => connector.id === "xyz.ithaca.porto")!;

	/**
	 *
	 * @dev Chain / Network.
	 *
	 * @param chains: All available chain in WAGMI config.
	 * @param chain: Chain config of the network connected. Will be `Undefined` if the connected chain is not set in the current network config.
	 *
	 */
	const chains = useChains();
	const chain = eoa.chain;
	const switchChain = useSwitchChain().mutate;
	const [isNetworkUnsupported, setIsNetworkUnsupported] = React.useState<boolean | undefined>(
		undefined,
	);

	const switchToDefaultChain = () =>
		switchChain(
			{ chainId: chains[0].id },
			{
				onError: (e) => console.log(e),
				onSuccess: (e) => console.log(e),
			},
		);

	/**
	 * @dev When the chain connected to the app change, verify if it's supported.
	 */
	React.useEffect(() => {
		setIsNetworkUnsupported(!chain);
	}, [chain]);

	/**
	 *
	 * @dev Provider.
	 *
	 */
	const provider = {
		name: eoa.connector?.name,
		image: eoa.connector?.icon,
	};

	/**
	 *
	 * @dev Account status.
	 *
	 */
	const isConnected = eoa.isConnected;
	const isConnecting = eoa.isConnecting || eoa.isReconnecting;
	const isDisconnected = eoa.isDisconnected;

	const status = eoa.status;

	const [hasSeenConnecting, setHasSeenConnecting] = React.useState(status === "connecting");
	React.useEffect(
		() => (status === "connecting" ? setHasSeenConnecting(status === "connecting") : () => {}),
		[status],
	);

	const [isMounted, setIsMounted] = React.useState(false);
	React.useEffect(() => setIsMounted(true), []);

	const ready = isMounted && hasSeenConnecting;

	// biome-ignore lint/correctness/useExhaustiveDependencies: switchToDefaultChain
	React.useEffect(() => {
		if (ready && isConnected && !chain) {
			switchToDefaultChain();
		}
	}, [ready, isConnected, chain]);

	/**
	 *
	 * @dev Connect / Disconnect.
	 *
	 */
	const { mutate: connectPrimitive } = useConnect();
	const { mutate: disconnectPrimitive } = useDisconnect();
	const connect = () =>
		connectPrimitive(
			{
				connector: injected(),
			},
			{
				onSuccess: (e) => console.log("Connect -> success: ", e),
				onError: (e) => console.log("Connect -> failed: ", e),
			},
		);
	const disconnect = () =>
		disconnectPrimitive(
			{},
			{
				onSuccess: (e) => console.log("Disconnect -> success: ", e),
				onError: (e) => console.log("Disconnect -> failed: ", e),
			},
		);

	return {
		client,
		publicClient,
		eoa,
		isConnected,
		isConnecting,
		isDisconnected,
		chain,
		status,
		chains,
		isNetworkUnsupported,
		connect,
		disconnect,
		switchToDefaultChain,
		switchChain,
		provider,
		portoConnector,
		ready,
	};
};

/**
 * @dev useWeb3 context.
 */
const Web3Context = React.createContext<ReturnType<typeof useWeb3Primitive> | undefined>(undefined);
const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const web3 = useWeb3Primitive();

	return <Web3Context.Provider value={web3}>{children}</Web3Context.Provider>;
};

/**
 * @dev useWeb3 context hook.
 */
const useWeb3 = () => {
	const context = React.useContext(Web3Context);
	if (context === undefined) {
		throw new Error("useWeb3 must be used within an Web3Provider");
	}
	return context;
};

export { useWeb3, Web3Context, Web3Provider };

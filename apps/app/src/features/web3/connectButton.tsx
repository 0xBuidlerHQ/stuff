"use client";

import { Loader2, LogOutIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { links } from "@/config/links";
import { NavigationItem } from "@/layouts/header";
import { Box } from "@/primitives/box";
import { Button } from "@/primitives/button";
import { useWeb3 } from "@/providers/web3";

const stateTransition = {
	initial: { opacity: 0, x: 16 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: 16 },
	transition: { duration: 0.2, ease: "easeOut" as const },
};

const LoadingButton = () => {
	return (
		<Box className="h-8 flex items-center justify-center">
			<Loader2 className="animate-spin size-4" />
		</Box>
	);
};

const ConnectedButton = () => {
	const { disconnect } = useWeb3();

	return (
		<Box className="flex gap-2 h-8 items-center text-sm font-medium">
			<NavigationItem {...links.account} />

			<Button onClick={disconnect}>
				<LogOutIcon className="size-4" />
			</Button>
		</Box>
	);
};

const DisconnectedButton = () => {
	const { connect } = useWeb3();

	return (
		<Box className="h-8 flex items-center">
			<Button onClick={connect} className="transition-all hover:bg-red-500 hover:text-background">
				<Box className="text-xs px-1">Connect</Box>
			</Button>
		</Box>
	);
};

const ConnectButton = () => {
	const { isConnected, status } = useWeb3();

	return (
		<AnimatePresence mode="wait" initial={false}>
			{(() => {
				if (status === "connecting" || status === "reconnecting") {
					return (
						<motion.div key="loading" {...stateTransition}>
							<LoadingButton />
						</motion.div>
					);
				}

				if (isConnected) {
					return (
						<motion.div key="connected" {...stateTransition}>
							<ConnectedButton />
						</motion.div>
					);
				}

				return (
					<motion.div key="disconnected" {...stateTransition}>
						<DisconnectedButton />
					</motion.div>
				);
			})()}
		</AnimatePresence>
	);
};

export { ConnectButton };

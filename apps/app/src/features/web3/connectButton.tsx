"use client";

import { Beaut } from "@0xhq/beaut";
import { Loader2, LogOutIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
	const { eoa, disconnect } = useWeb3();

	return (
		<Box className="flex gap-2 h-8 items-center text-sm font-medium">
			<Box className="h-full flex justify-center items-center bg-muted rounded px-4 w-40">
				<Box>{Beaut.address(eoa.address)}</Box>
			</Box>

			<Button
				onClick={disconnect}
				className="h-full flex justify-center items-center rounded transition-all px-3 bg-foreground text-background"
			>
				<LogOutIcon className="size-4" />
			</Button>
		</Box>
	);
};

const DisconnectedButton = () => {
	const { connect } = useWeb3();

	return (
		<Button onClick={connect}>
			<Box className="h-8 bg-foreground text-background flex items-center justify-center p-4 rounded">
				LOG IN
			</Box>
		</Button>
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

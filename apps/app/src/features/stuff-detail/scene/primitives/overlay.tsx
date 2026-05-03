"use client";

import React from "react";
import { cn } from "@/utils";

const SceneOverlay = () => {
	const [show, setShow] = React.useState(true);

	React.useEffect(() => {
		const timeout = setTimeout(() => setShow(false), 500);
		return () => clearTimeout(timeout);
	}, []);

	return (
		<div
			className={cn(
				"absolute inset-0 z-10 bg-background transition-opacity duration-500",
				show ? "opacity-100" : "pointer-events-none opacity-0",
			)}
		/>
	);
};

export { SceneOverlay };

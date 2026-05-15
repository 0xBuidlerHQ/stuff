"use client";

import React from "react";
import { usePantones } from "@/queries/usePantones";
import { useStuffCollections } from "@/queries/useStuffCollections";

type PantoneColor = {
	pantone: string;
	name: string;
	hexValue: string;
	cmyk: string;
};

const useStuffEcosystemPrimitive = () => {
	const { mainColors, pantoneColors, pantoneColorsById } = usePantones({});
	const { stuffCollections, stuffCollectionsByAddress } = useStuffCollections();

	const getPantoneDisplayColor = React.useCallback(
		(pantone: string) => pantoneColorsById.get(pantone)?.hexValue ?? pantone,
		[pantoneColorsById],
	);

	const decodeCanvasToPixels = React.useCallback(
		(canvas: readonly string[]) => canvas.map((pantone) => getPantoneDisplayColor(pantone)),
		[getPantoneDisplayColor],
	);

	return {
		pantoneColors,
		mainColors,
		pantoneColorsById,
		stuffCollections,
		stuffCollectionsByAddress,
		getPantoneDisplayColor,
		decodeCanvasToPixels,
	};
};

const StuffEcosystemContext = React.createContext<
	ReturnType<typeof useStuffEcosystemPrimitive> | undefined
>(undefined);

const StuffEcosystemProvider = ({ children }: React.PropsWithChildren) => {
	const stuffEcosystem = useStuffEcosystemPrimitive();

	return (
		<StuffEcosystemContext.Provider value={stuffEcosystem}>
			{children}
		</StuffEcosystemContext.Provider>
	);
};

const useStuffEcosystem = () => {
	const context = React.useContext(StuffEcosystemContext);
	if (context === undefined) {
		throw new Error("useStuffEcosystem must be used within a StuffEcosystemProvider");
	}
	return context;
};

export type { PantoneColor };
export { StuffEcosystemContext, StuffEcosystemProvider, useStuffEcosystem };

import { usePonderQuery } from "@ponder/react";
import React from "react";
import { ponderSchema } from "@/providers/ponder.config";

type UseQPantonesProps = {};

const useQPantones = (_: UseQPantonesProps) => {
	return usePonderQuery({
		refetchOnMount: "always",
		refetchOnWindowFocus: "always",
		queryFn: (db) => db.select().from(ponderSchema.pantone),
	});
};

type UsePantonesProps = UseQPantonesProps;

const usePantones = (props: UsePantonesProps) => {
	const query = useQPantones(props);

	const pantoneColors = query.data ?? [];

	const pantoneColorsById = React.useMemo(
		() => new Map(pantoneColors.map((pantone) => [pantone.pantone, pantone] as const)),
		[pantoneColors],
	);

	const mainColors = React.useMemo(() => {
		if (pantoneColors.length === 0) {
			return undefined;
		}

		const black = pantoneColorsById.get("19-3911 TCX");
		const white = pantoneColorsById.get("11-0601 TCX");
		const blue = pantoneColorsById.get("18-4032 TCX");
		const yellow = pantoneColorsById.get("14-0848 TCX");

		if (!black || !white || !blue || !yellow) {
			return undefined;
		}

		return {
			black,
			white,
			blue,
			yellow,
		} as const;
	}, [pantoneColors.length, pantoneColorsById]);

	return {
		q: query,

		pantoneColors,
		pantoneColorsById,
		mainColors,
	};
};

export { usePantones };

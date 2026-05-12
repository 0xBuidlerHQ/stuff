"use client";

import { usePonderQuery } from "@ponder/react";
import { useMemo } from "react";
import type { StuffCollection } from "@/config/types";
import { ponderSchema } from "@/providers/ponder.config";
import { augmentStuffCollection } from "@/queries/augments";

const useQStuffCollections = () => {
	return usePonderQuery({
		refetchOnMount: "always",
		refetchOnWindowFocus: "always",
		queryFn: (db) => db.select().from(ponderSchema.stuffCollection),
	});
};

const useStuffCollections = () => {
	const query = useQStuffCollections();

	const stuffCollections = useMemo(
		() => (query.data ?? []).map(augmentStuffCollection) as StuffCollection[],
		[query.data],
	);

	const stuffCollectionsByAddress = useMemo(
		() =>
			new Map(
				stuffCollections.map((stuffCollection) => [
					stuffCollection.address.toLowerCase(),
					stuffCollection,
				]),
			),
		[stuffCollections],
	);

	return {
		q: query,

		stuffCollections,
		stuffCollectionsByAddress,
	};
};

export { useStuffCollections };

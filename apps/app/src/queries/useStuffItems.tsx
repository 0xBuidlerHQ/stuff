"use client";

import { desc } from "@ponder/client";
import { usePonderQuery } from "@ponder/react";
import type { StuffItem } from "@/config/types";
import { ponderSchema } from "@/providers/ponder.config";
import { augmentStuffItem } from "@/queries/augments";
import { useStuffCollections } from "@/queries/useStuffCollections";

type UseStuffItemsProps = {
	limit: number;
};

const useQStuffItems = ({ limit }: UseStuffItemsProps) => {
	return usePonderQuery({
		refetchOnMount: "always",
		refetchOnWindowFocus: "always",
		queryFn: (db) =>
			db
				.select()
				.from(ponderSchema.stuffItem)
				.orderBy(desc(ponderSchema.stuffItem.creationDate))
				.limit(limit),
	});
};

const useStuffItems = ({ limit }: UseStuffItemsProps) => {
	const query = useQStuffItems({ limit });
	const { stuffCollectionsByAddress } = useStuffCollections();

	const stuffItems: StuffItem[] = (query.data ?? [])
		.map((stuffItem) => augmentStuffItem(stuffItem, stuffCollectionsByAddress))
		.filter((stuffItem): stuffItem is StuffItem => stuffItem !== null);

	return {
		q: query,

		stuffItems,
	};
};

export { useStuffItems };

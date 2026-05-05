"use client";

import { eq } from "@ponder/client";
import { usePonderQuery } from "@ponder/react";
import type { Address } from "viem";
import { ponderSchema } from "@/providers/ponder.config";

type UseQStuffItemsByOwnerProps = {
	owner: Address | undefined;
};
const useQStuffItemsByOwner = (props: UseQStuffItemsByOwnerProps) => {
	const owner = props.owner?.toLowerCase() as Address;

	const isQueryEnabled = !!owner;

	const query = usePonderQuery({
		enabled: isQueryEnabled,
		refetchOnMount: "always",
		refetchOnWindowFocus: "always",
		queryFn: (db) =>
			db.select().from(ponderSchema.stuffItem).where(eq(ponderSchema.stuffItem.owner, owner)),
	});

	return query;
};

type UseStuffItemsByOwnerProps = {
	owner: Address | undefined;
};
const useStuffItemsByOwner = (props: UseStuffItemsByOwnerProps) => {
	const query = useQStuffItemsByOwner({ owner: props.owner });

	return {
		q: query,
		stuffItemsByOwner: query.data || [],
	};
};

export { useQStuffItemsByOwner, useStuffItemsByOwner };

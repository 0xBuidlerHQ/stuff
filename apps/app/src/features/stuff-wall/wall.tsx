"use client";

import { useEffect, useRef, useState } from "react";
import { decodeCanvasToPixels, GridPreview } from "@/features/grid";
import { Box } from "@/primitives/box";
import { useStuffItems } from "@/queries/useStuffItems";

const INITIAL_VISIBLE_COUNT = 36;
const LOAD_MORE_COUNT = 24;

const StuffWall = () => {
	const [limit, setLimit] = useState(INITIAL_VISIBLE_COUNT);
	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const { q, stuffItems } = useStuffItems({ limit });
	const hasMore = (q.data?.length ?? 0) >= limit;

	useEffect(() => {
		if (!hasMore) return;

		const sentinel = sentinelRef.current;
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;

				setLimit((currentLimit) => currentLimit + LOAD_MORE_COUNT);
			},
			{ rootMargin: "800px 0px" },
		);

		observer.observe(sentinel);

		return () => observer.disconnect();
	}, [hasMore]);

	return (
		<Box className="grid gap-4">
			<Box className="grid grid-cols-2 gap-0 desktop:grid-cols-6">
				{stuffItems.map((stuffItem) => {
					const pixels = decodeCanvasToPixels(stuffItem.canvas, stuffItem.collection.palette);

					return (
						<GridPreview
							key={`${stuffItem.stuffCollectionAddress}-${stuffItem.tokenId.toString()}`}
							pixels={pixels}
							className="border border-border"
						/>
					);
				})}
			</Box>

			{q.isLoading && <Box className="h-24" />}
			<div ref={sentinelRef} className="h-px" />
		</Box>
	);
};

export { StuffWall };

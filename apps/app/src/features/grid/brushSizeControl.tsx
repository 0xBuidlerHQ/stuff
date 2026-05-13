"use client";

import type { BrushSizeControlProps } from "@/features/grid/types";
import { Button } from "@/primitives/button";

const BrushSizeControl = ({
	brushSize,
	maxBrushSize,
	onBrushSizeChange,
}: BrushSizeControlProps) => {
	return (
		<div className="flex items-center gap-2">
			<Button
				aria-label="Decrease brush size"
				className="flex h-8 w-8 items-center justify-center border border-border text-sm transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
				onClick={() => onBrushSizeChange(Math.max(1, brushSize - 1))}
				disabled={brushSize <= 1}
			>
				-
			</Button>

			<span className="min-w-8 text-center text-xs tabular-nums">{brushSize}</span>

			<Button
				aria-label="Increase brush size"
				className="flex h-8 w-8 items-center justify-center border border-border text-sm transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
				onClick={() => onBrushSizeChange(Math.min(maxBrushSize, brushSize + 1))}
				disabled={brushSize >= maxBrushSize}
			>
				+
			</Button>
		</div>
	);
};

export { BrushSizeControl };

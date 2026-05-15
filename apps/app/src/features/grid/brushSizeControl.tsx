"use client";

import type { BrushSizeControlProps } from "@/features/grid/types";
import { Button } from "@/primitives/button";

const BrushSizeControl = ({
	brushSize,
	maxBrushSize,
	onBrushSizeChange,
}: BrushSizeControlProps) => {
	return (
		<div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-background px-3 py-2">
			<div className="flex flex-col gap-0.5">
				<div className="text-[10px] font-unbounded uppercase text-muted-foreground">Brush</div>

				<div className="text-xs text-foreground/75">
					Size {brushSize} of {maxBrushSize}.
				</div>
			</div>

			<div className="flex items-center rounded-full border border-border/80 bg-muted p-1">
				<Button
					aria-label="Decrease brush size"
					className="flex h-9 w-9 items-center justify-center rounded-full text-base transition hover:bg-background disabled:pointer-events-none disabled:opacity-40"
					onClick={() => onBrushSizeChange(Math.max(1, brushSize - 1))}
					disabled={brushSize <= 1}
				>
					-
				</Button>

				<div className="min-w-10 text-center text-sm font-medium tabular-nums text-foreground">
					{brushSize}
				</div>

				<Button
					aria-label="Increase brush size"
					className="flex h-9 w-9 items-center justify-center rounded-full text-base transition hover:bg-background disabled:pointer-events-none disabled:opacity-40"
					onClick={() => onBrushSizeChange(Math.min(maxBrushSize, brushSize + 1))}
					disabled={brushSize >= maxBrushSize}
				>
					+
				</Button>
			</div>
		</div>
	);
};

export { BrushSizeControl };

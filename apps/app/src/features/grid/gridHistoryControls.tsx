"use client";

import { Redo2, RotateCcw, Undo2 } from "lucide-react";
import type { GridHistoryControlsProps } from "@/features/grid/types";
import { Box } from "@/primitives/box";
import { Button } from "@/primitives/button";

const GridHistoryControls = ({
	canPaint,
	canUndo,
	canRedo,
	canReset,
	onUndo,
	onRedo,
	onReset,
}: GridHistoryControlsProps) => {
	return (
		<Box className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-background px-3 py-2">
			<div className="flex flex-col gap-0.5">
				<div className="text-[10px] font-unbounded uppercase text-muted-foreground">History</div>
				<div className="text-xs text-foreground/75">Undo, redo, or reset the canvas.</div>
			</div>

			<div className="flex items-center gap-1 rounded-full border border-border/80 bg-muted p-1">
				<Button
					aria-label="Undo"
					className="flex h-9 items-center gap-2 rounded-full px-3 text-xs font-medium text-foreground transition hover:bg-background disabled:pointer-events-none disabled:opacity-40"
					onClick={onUndo}
					disabled={!canUndo}
				>
					<Undo2 className="h-4 w-4" />
					Undo
				</Button>

				<Button
					aria-label="Redo"
					className="flex h-9 items-center gap-2 rounded-full px-3 text-xs font-medium text-foreground transition hover:bg-background disabled:pointer-events-none disabled:opacity-40"
					onClick={onRedo}
					disabled={!canRedo}
				>
					<Redo2 className="h-4 w-4" />
					Redo
				</Button>

				<Button
					aria-label="Reset to default"
					className="flex h-9 items-center gap-2 rounded-full px-3 text-xs font-medium text-foreground transition hover:bg-background disabled:pointer-events-none disabled:opacity-40"
					onClick={onReset}
					disabled={!canPaint || !canReset}
				>
					<RotateCcw className="h-4 w-4" />
					Reset
				</Button>
			</div>
		</Box>
	);
};

export { GridHistoryControls };

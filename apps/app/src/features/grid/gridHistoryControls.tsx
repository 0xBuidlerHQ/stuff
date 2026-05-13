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
		<Box className="flex items-center gap-2">
			<Button
				aria-label="Undo"
				className="flex h-8 w-8 items-center justify-center border border-border transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
				onClick={onUndo}
				disabled={!canUndo}
			>
				<Undo2 className="h-4 w-4" />
			</Button>

			<Button
				aria-label="Redo"
				className="flex h-8 w-8 items-center justify-center border border-border transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
				onClick={onRedo}
				disabled={!canRedo}
			>
				<Redo2 className="h-4 w-4" />
			</Button>

			<Button
				aria-label="Reset to default"
				className="flex h-8 w-8 items-center justify-center border border-border transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
				onClick={onReset}
				disabled={!canPaint || !canReset}
			>
				<RotateCcw className="h-4 w-4" />
			</Button>
		</Box>
	);
};

export { GridHistoryControls };

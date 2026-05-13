"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getBrushPixelIndexes } from "@/features/grid/brush";
import type { PixelCanvasProps } from "@/features/grid/types";
import { cn } from "@/utils";

const PixelCanvas = ({
	size,
	brushSize,
	pixels,
	onBeginStroke,
	onPaintPixel,
}: PixelCanvasProps) => {
	const [isDrawing, setIsDrawing] = useState(false);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	const hoveredBrushIndexes = useMemo(() => {
		if (hoveredIndex === null) {
			return new Set<number>();
		}

		return new Set(getBrushPixelIndexes(hoveredIndex, size, brushSize));
	}, [brushSize, hoveredIndex, size]);

	const startDrawing = (index: number) => {
		setHoveredIndex(index);
		setIsDrawing(true);
		onBeginStroke();
		onPaintPixel(index);
	};

	const stopDrawing = useCallback(() => {
		setHoveredIndex(null);
		setIsDrawing(false);
	}, []);

	useEffect(() => {
		if (!isDrawing) {
			return;
		}

		window.addEventListener("pointerup", stopDrawing);
		window.addEventListener("pointercancel", stopDrawing);

		return () => {
			window.removeEventListener("pointerup", stopDrawing);
			window.removeEventListener("pointercancel", stopDrawing);
		};
	}, [isDrawing, stopDrawing]);

	const clearHoverPreview = () => {
		setHoveredIndex(null);
	};

	const paintWhileDrawing = (index: number) => {
		setHoveredIndex(index);

		if (!isDrawing) {
			return;
		}

		onPaintPixel(index);
	};

	return (
		<div
			className="grid aspect-square w-full touch-none overflow-hidden border border-muted-foreground bg-background"
			style={{
				gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
				gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
			}}
			onPointerLeave={clearHoverPreview}
			onPointerUp={stopDrawing}
			onPointerCancel={stopDrawing}
		>
			{pixels.map((color, index) => (
				// Last row/column keep the outer container border only.
				<button
					key={index}
					type="button"
					aria-label={`Pixel ${index + 1}`}
					className={cn(
						"block min-h-0 min-w-0 h-full w-full border-border/50 transition-colors",
						index % size !== size - 1 && "border-r",
						index < size * (size - 1) && "border-b",
						hoveredBrushIndexes.has(index) && "ring-1 ring-foreground ring-inset",
					)}
					style={{ backgroundColor: color }}
					onPointerDown={() => startDrawing(index)}
					onPointerEnter={() => paintWhileDrawing(index)}
				/>
			))}
		</div>
	);
};

export { PixelCanvas };

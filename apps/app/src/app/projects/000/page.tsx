"use client";

import { useState } from "react";
import { Container } from "@/primitives/container";
import { cn } from "@/utils";

const GRID_SIZE = 32;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;
const EMPTY_COLOR = "transparent";

const palette = [
	"#111111",
	"#ffffff",
	"#ef4444",
	"#f97316",
	"#facc15",
	"#22c55e",
	"#14b8a6",
	"#38bdf8",
	"#2563eb",
	"#8b5cf6",
	"#ec4899",
	"#a16207",
] as const;

const Page = () => {
	const [selectedColor, setSelectedColor] = useState<(typeof palette)[number]>(palette[0]);
	const [pixels, setPixels] = useState<string[]>(() => Array(CELL_COUNT).fill(EMPTY_COLOR));
	const [isDrawing, setIsDrawing] = useState(false);

	const paintPixel = (index: number) => {
		setPixels((currentPixels) => {
			if (currentPixels[index] === selectedColor) {
				return currentPixels;
			}

			const nextPixels = [...currentPixels];
			nextPixels[index] = selectedColor;
			return nextPixels;
		});
	};

	const clearPixels = () => {
		setPixels(Array(CELL_COUNT).fill(EMPTY_COLOR));
	};

	const startDrawing = (index: number) => {
		setIsDrawing(true);
		paintPixel(index);
	};

	const stopDrawing = () => {
		setIsDrawing(false);
	};

	const paintWhileDrawing = (index: number) => {
		if (!isDrawing) {
			return;
		}

		paintPixel(index);
	};

	return (
		<Container className="flex h-full min-h-[calc(100dvh-9rem)] flex-col gap-5 py-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					{palette.map((color) => {
						const isSelected = selectedColor === color;

						return (
							<button
								key={color}
								type="button"
								aria-label={`Select ${color}`}
								aria-pressed={isSelected}
								className={cn(
									"h-8 w-8 rounded-sm border border-border transition outline-offset-2",
									isSelected && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
								)}
								style={{ backgroundColor: color }}
								onClick={() => setSelectedColor(color)}
							/>
						);
					})}
				</div>

				<button
					type="button"
					className="h-8 rounded-sm border border-border px-3 text-xs transition hover:bg-muted"
					onClick={clearPixels}
				>
					clear
				</button>
			</div>

			<div className="flex min-h-0 grow items-center justify-center">
				<div
					className="grid aspect-square w-full max-w-[min(100%,calc(100dvh-14rem))] touch-none overflow-hidden border border-border bg-background"
					style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
					onPointerLeave={stopDrawing}
					onPointerUp={stopDrawing}
				>
					{pixels.map((color, index) => (
						<button
							key={index}
							type="button"
							aria-label={`Pixel ${index + 1}`}
							className="aspect-square border-r border-b border-border/50 transition-colors hover:ring-1 hover:ring-foreground hover:ring-inset"
							style={{ backgroundColor: color }}
							onPointerDown={() => startDrawing(index)}
							onPointerEnter={() => paintWhileDrawing(index)}
						/>
					))}
				</div>
			</div>
		</Container>
	);
};

export default Page;

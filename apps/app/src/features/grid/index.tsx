"use client";

import { Redo2, Trash2, Undo2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/utils";

const EMPTY_COLOR = "transparent";

type GridProps = {
	size: number;
	cellSize: number;
	palettes: readonly string[];
};

type PalettePickerProps = {
	palettes: readonly string[];
	selectedColor: string;
	onSelectColor: (color: string) => void;
};

type PixelCanvasProps = {
	size: number;
	cellSize: number;
	brushSize: number;
	pixels: readonly string[];
	onBeginStroke: () => void;
	onPaintPixel: (index: number) => void;
};

type BrushSizeControlProps = {
	brushSize: number;
	maxBrushSize: number;
	onBrushSizeChange: (brushSize: number) => void;
};

const BrushSizeControl = ({
	brushSize,
	maxBrushSize,
	onBrushSizeChange,
}: BrushSizeControlProps) => {
	return (
		<div className="flex items-center gap-2">
			<button
				type="button"
				aria-label="Decrease brush size"
				className="flex h-8 w-8 items-center justify-center rounded-sm border border-border text-sm transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
				onClick={() => onBrushSizeChange(Math.max(1, brushSize - 1))}
				disabled={brushSize <= 1}
			>
				-
			</button>
			<span className="min-w-8 text-center text-xs tabular-nums">{brushSize}</span>
			<button
				type="button"
				aria-label="Increase brush size"
				className="flex h-8 w-8 items-center justify-center rounded-sm border border-border text-sm transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
				onClick={() => onBrushSizeChange(Math.min(maxBrushSize, brushSize + 1))}
				disabled={brushSize >= maxBrushSize}
			>
				+
			</button>
		</div>
	);
};

const PalettePicker = ({ palettes, selectedColor, onSelectColor }: PalettePickerProps) => {
	return (
		<div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
			{palettes.map((color) => {
				const isSelected = selectedColor === color;

				return (
					<button
						key={color}
						type="button"
						aria-label={`Select ${color}`}
						aria-pressed={isSelected}
						className={cn(
							"h-8 w-8 shrink-0 rounded-sm border border-border transition outline-offset-2",
							isSelected && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
						)}
						style={{ backgroundColor: color }}
						onClick={() => onSelectColor(color)}
					/>
				);
			})}
		</div>
	);
};

const getBrushPixelIndexes = (index: number, size: number, brushSize: number) => {
	const indexes: number[] = [];
	const centerRow = Math.floor(index / size);
	const centerColumn = index % size;
	const offsetStart = -Math.floor((brushSize - 1) / 2);
	const offsetEnd = offsetStart + brushSize - 1;

	for (let rowOffset = offsetStart; rowOffset <= offsetEnd; rowOffset++) {
		for (let columnOffset = offsetStart; columnOffset <= offsetEnd; columnOffset++) {
			const row = centerRow + rowOffset;
			const column = centerColumn + columnOffset;

			if (row < 0 || row >= size || column < 0 || column >= size) {
				continue;
			}

			indexes.push(row * size + column);
		}
	}

	return indexes;
};

const isBlankCanvas = (pixels: readonly string[]) => {
	return pixels.every((color) => color === EMPTY_COLOR);
};

const PixelCanvas = ({
	size,
	cellSize,
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
			className="grid aspect-square touch-none overflow-hidden border border-border bg-background"
			style={{
				gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
				width: `min(100%, ${size * cellSize}px, calc(100dvh - 14rem))`,
			}}
			onPointerLeave={clearHoverPreview}
			onPointerUp={stopDrawing}
			onPointerCancel={stopDrawing}
		>
			{pixels.map((color, index) => (
				<button
					key={index}
					type="button"
					aria-label={`Pixel ${index + 1}`}
					className={cn(
						"aspect-square border-r border-b border-border/50 transition-colors",
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

const Grid = ({ size, cellSize, palettes }: GridProps) => {
	const cellCount = size * size;
	const resolvedCellSize = Math.max(1, cellSize);
	const maxBrushSize = Math.max(1, Math.min(size, 8));
	const [selectedColor, setSelectedColor] = useState<string>(palettes[0] ?? EMPTY_COLOR);
	const [pixels, setPixels] = useState<string[]>(() => Array(cellCount).fill(EMPTY_COLOR));
	const [history, setHistory] = useState<string[][]>([]);
	const [redoHistory, setRedoHistory] = useState<string[][]>([]);
	const [brushSize, setBrushSize] = useState(1);
	const strokeHasHistoryRef = useRef(false);

	useEffect(() => {
		setPixels(Array(cellCount).fill(EMPTY_COLOR));
		setHistory([]);
		setRedoHistory([]);
		strokeHasHistoryRef.current = false;
	}, [cellCount]);

	useEffect(() => {
		if (!palettes.includes(selectedColor)) {
			setSelectedColor(palettes[0] ?? EMPTY_COLOR);
		}
	}, [palettes, selectedColor]);

	const canPaint = useMemo(() => size > 0 && palettes.length > 0, [palettes.length, size]);

	const beginStroke = () => {
		if (!canPaint) {
			return;
		}

		strokeHasHistoryRef.current = false;
	};

	const undo = useCallback(() => {
		const previousPixels = history.at(-1);

		if (!previousPixels) {
			return;
		}

		setHistory(history.slice(0, -1));
		setRedoHistory((currentRedoHistory) => [...currentRedoHistory, pixels]);
		setPixels(previousPixels);
	}, [history, pixels]);

	const redo = useCallback(() => {
		const nextPixels = redoHistory.at(-1);

		if (!nextPixels) {
			return;
		}

		setRedoHistory(redoHistory.slice(0, -1));
		setHistory((currentHistory) => [...currentHistory, pixels]);
		setPixels(nextPixels);
	}, [pixels, redoHistory]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key.toLowerCase() !== "z" || (!event.ctrlKey && !event.metaKey)) {
				return;
			}

			event.preventDefault();

			if (event.shiftKey) {
				redo();
				return;
			}

			undo();
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [redo, undo]);

	const paintPixel = (index: number) => {
		if (!canPaint) {
			return;
		}

		setPixels((currentPixels) => {
			const nextPixels = [...currentPixels];
			let didChange = false;

			for (const pixelIndex of getBrushPixelIndexes(index, size, brushSize)) {
				if (nextPixels[pixelIndex] !== selectedColor) {
					nextPixels[pixelIndex] = selectedColor;
					didChange = true;
				}
			}

			if (!didChange) {
				return currentPixels;
			}

			if (!strokeHasHistoryRef.current) {
				setHistory((currentHistory) => [...currentHistory, currentPixels]);
				setRedoHistory([]);
				strokeHasHistoryRef.current = true;
			}

			return nextPixels;
		});
	};

	const clearPixels = () => {
		if (!canPaint) {
			return;
		}

		if (isBlankCanvas(pixels)) {
			return;
		}

		setHistory((currentHistory) => [...currentHistory, pixels]);
		setRedoHistory([]);
		setPixels(Array(cellCount).fill(EMPTY_COLOR));
	};

	return (
		<div className="h-full">
			<div className="flex items-center justify-center p-4">
				<PixelCanvas
					size={size}
					cellSize={resolvedCellSize}
					brushSize={brushSize}
					pixels={pixels}
					onBeginStroke={beginStroke}
					onPaintPixel={paintPixel}
				/>
			</div>

			<div className="sticky bottom-0 z-10 -mx-(--app-px) flex flex-col gap-3 border-t border-border bg-background/95 px-(--app-px) py-3 backdrop-blur sm:static sm:mx-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
				<div className="flex items-center justify-between gap-3">
					<BrushSizeControl
						brushSize={brushSize}
						maxBrushSize={maxBrushSize}
						onBrushSizeChange={setBrushSize}
					/>

					<div className="flex items-center gap-2">
						<button
							type="button"
							aria-label="Undo"
							className="flex h-8 w-8 items-center justify-center rounded-sm border border-border transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
							onClick={undo}
							disabled={history.length === 0}
						>
							<Undo2 className="h-4 w-4" />
						</button>
						<button
							type="button"
							aria-label="Redo"
							className="flex h-8 w-8 items-center justify-center rounded-sm border border-border transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
							onClick={redo}
							disabled={redoHistory.length === 0}
						>
							<Redo2 className="h-4 w-4" />
						</button>
						<button
							type="button"
							aria-label="Clear"
							className="flex h-8 w-8 items-center justify-center rounded-sm border border-border transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
							onClick={clearPixels}
							disabled={!canPaint || isBlankCanvas(pixels)}
						>
							<Trash2 className="h-4 w-4" />
						</button>
					</div>
				</div>

				<PalettePicker
					palettes={palettes}
					selectedColor={selectedColor}
					onSelectColor={setSelectedColor}
				/>
			</div>
		</div>
	);
};

export { Grid };

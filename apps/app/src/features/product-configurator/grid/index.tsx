"use client";

import { Redo2, RotateCcw, Undo2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@/primitives/box";
import { Button } from "@/primitives/button";
import { cn } from "@/utils";

const EMPTY_COLOR = "transparent";

type GridProps = {
	size: number;
	palettes: readonly string[];
	pixels: readonly string[];
	onPixelsChange: (pixels: string[]) => void;
};

type GridPreviewProps = {
	size: number;
	pixels: readonly string[];
	className?: string;
};

type PalettePickerProps = {
	palettes: readonly string[];
	selectedColor: string;
	onSelectColor: (color: string) => void;
};

type PixelCanvasProps = {
	size: number;
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

const COMPANY_LOGO = [
	[0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 1, 0, 1, 0],
	[0, 0, 1, 1, 1, 0, 0],
	[0, 1, 1, 1, 1, 1, 0],
	[0, 0, 1, 1, 1, 0, 0],
	[0, 1, 0, 1, 0, 1, 0],
	[0, 0, 0, 0, 0, 0, 0],
] as const;

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

const PalettePicker = ({ palettes, selectedColor, onSelectColor }: PalettePickerProps) => {
	return (
		<div className="flex items-center py-1 gap-2 px-1 overflow-x-scroll">
			{palettes.map((color) => {
				const isSelected = selectedColor === color;

				return (
					<button
						key={color}
						type="button"
						aria-label={`Select ${color}`}
						aria-pressed={isSelected}
						className={cn(
							"size-4 shrink-0 border border-border transition outline-offset-2",
							isSelected && "ring-1 ring-foreground ring-offset-1 ring-offset-background",
						)}
						style={{ backgroundColor: color }}
						onClick={() => onSelectColor(color)}
					/>
				);
			})}
		</div>
	);
};

const getDefaultPixels = (size: number, firstColor: string, secondColor: string) => {
	const logoCellSize = Math.max(1, Math.floor(size / COMPANY_LOGO.length));
	const pixels = Array(size * size).fill(firstColor);

	for (let logoRow = 0; logoRow < COMPANY_LOGO.length; logoRow++) {
		for (let logoColumn = 0; logoColumn < COMPANY_LOGO[logoRow].length; logoColumn++) {
			const color = COMPANY_LOGO[logoRow][logoColumn] === 1 ? secondColor : firstColor;
			const startRow = logoRow * logoCellSize;
			const startColumn = logoColumn * logoCellSize;

			for (let row = startRow; row < Math.min(size, startRow + logoCellSize); row++) {
				for (
					let column = startColumn;
					column < Math.min(size, startColumn + logoCellSize);
					column++
				) {
					pixels[row * size + column] = color;
				}
			}
		}
	}

	return pixels;
};

const GridPreview = ({ size, pixels, className }: GridPreviewProps) => {
	return (
		<div
			className={cn(
				"grid aspect-square w-full overflow-hidden border border-muted bg-background",
				className,
			)}
			style={{
				gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
				gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
			}}
		>
			{pixels.map((color, index) => (
				<div
					key={index}
					className={cn(
						"min-h-0 min-w-0 border-border/40",
						index % size !== size - 1 && "border-r",
						index < size * (size - 1) && "border-b",
					)}
					style={{ backgroundColor: color }}
				/>
			))}
		</div>
	);
};

const arePixelsEqual = (left: readonly string[], right: readonly string[]) => {
	if (left.length !== right.length) {
		return false;
	}

	return left.every((color, index) => color === right[index]);
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

const Grid = ({ size, palettes, pixels, onPixelsChange }: GridProps) => {
	const maxBrushSize = Math.max(1, Math.min(size, 8));
	const [selectedColor, setSelectedColor] = useState<string>(palettes[0] ?? EMPTY_COLOR);
	const firstColor = palettes[0] ?? EMPTY_COLOR;
	const secondColor = palettes[1] ?? firstColor;
	const defaultPixels = useMemo(
		() => getDefaultPixels(size, firstColor, secondColor),
		[size, firstColor, secondColor],
	);
	const [history, setHistory] = useState<string[][]>([]);
	const [redoHistory, setRedoHistory] = useState<string[][]>([]);
	const [brushSize, setBrushSize] = useState(1);
	const strokeHasHistoryRef = useRef(false);
	const defaultPixelsRef = useRef(defaultPixels);

	useEffect(() => {
		defaultPixelsRef.current = defaultPixels;
		setHistory([]);
		setRedoHistory([]);
		strokeHasHistoryRef.current = false;
	}, [defaultPixels]);

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
		setRedoHistory((currentRedoHistory) => [...currentRedoHistory, [...pixels]]);
		onPixelsChange(previousPixels);
	}, [history, onPixelsChange, pixels]);

	const redo = useCallback(() => {
		const nextPixels = redoHistory.at(-1);

		if (!nextPixels) {
			return;
		}

		setRedoHistory(redoHistory.slice(0, -1));
		setHistory((currentHistory) => [...currentHistory, [...pixels]]);
		onPixelsChange(nextPixels);
	}, [onPixelsChange, pixels, redoHistory]);

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

		const nextPixels = [...pixels];
		let didChange = false;

		for (const pixelIndex of getBrushPixelIndexes(index, size, brushSize)) {
			if (nextPixels[pixelIndex] !== selectedColor) {
				nextPixels[pixelIndex] = selectedColor;
				didChange = true;
			}
		}

		if (!didChange) {
			return;
		}

		if (!strokeHasHistoryRef.current) {
			setHistory((currentHistory) => [...currentHistory, [...pixels]]);
			setRedoHistory([]);
			strokeHasHistoryRef.current = true;
		}

		onPixelsChange(nextPixels);
	};

	const clearPixels = () => {
		if (!canPaint) {
			return;
		}

		if (arePixelsEqual(pixels, defaultPixelsRef.current)) {
			return;
		}

		setHistory((currentHistory) => [...currentHistory, [...pixels]]);
		setRedoHistory([]);
		const nextPixels = getDefaultPixels(size, firstColor, secondColor);
		defaultPixelsRef.current = nextPixels;
		onPixelsChange(nextPixels);
	};

	return (
		<div className="h-full overflow-hidden">
			<div className="flex items-center justify-center p-4">
				<PixelCanvas
					size={size}
					brushSize={brushSize}
					pixels={pixels}
					onBeginStroke={beginStroke}
					onPaintPixel={paintPixel}
				/>
			</div>

			<div className="pt-4 flex flex-col gap-2">
				<Box className="flex items-center justify-center gap-10">
					<BrushSizeControl
						brushSize={brushSize}
						maxBrushSize={maxBrushSize}
						onBrushSizeChange={setBrushSize}
					/>

					<Box className="flex items-center gap-2">
						<Button
							aria-label="Undo"
							className="flex h-8 w-8 items-center justify-center border border-border transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
							onClick={undo}
							disabled={history.length === 0}
						>
							<Undo2 className="h-4 w-4" />
						</Button>

						<Button
							aria-label="Redo"
							className="flex h-8 w-8 items-center justify-center border border-border transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
							onClick={redo}
							disabled={redoHistory.length === 0}
						>
							<Redo2 className="h-4 w-4" />
						</Button>

						<Button
							aria-label="Reset to default"
							className="flex h-8 w-8 items-center justify-center border border-border transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
							onClick={clearPixels}
							disabled={!canPaint || arePixelsEqual(pixels, defaultPixelsRef.current)}
						>
							<RotateCcw className="h-4 w-4" />
						</Button>
					</Box>
				</Box>

				<Box className="flex justify-center">
					<PalettePicker
						palettes={palettes}
						selectedColor={selectedColor}
						onSelectColor={setSelectedColor}
					/>
				</Box>
			</div>
		</div>
	);
};

export { Grid, GridPreview, getDefaultPixels };

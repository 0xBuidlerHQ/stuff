"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getBrushPixelIndexes } from "@/features/grid/brush";
import { BrushSizeControl } from "@/features/grid/brushSizeControl";
import { GridHistoryControls } from "@/features/grid/gridHistoryControls";
import { PalettePicker } from "@/features/grid/palettePicker";
import { PixelCanvas } from "@/features/grid/pixelCanvas";
import type { GridProps } from "@/features/grid/types";
import { arePixelsEqual, CANVAS_SIZE, EMPTY_COLOR, getDefaultPixels } from "@/features/grid/utils";
import { Box } from "@/primitives/box";

const Grid = ({ size = CANVAS_SIZE, palettes, pixels, onPixelsChange }: GridProps) => {
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

					<GridHistoryControls
						canPaint={canPaint}
						canUndo={history.length > 0}
						canRedo={redoHistory.length > 0}
						canReset={!arePixelsEqual(pixels, defaultPixelsRef.current)}
						onUndo={undo}
						onRedo={redo}
						onReset={clearPixels}
					/>
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

export { Grid };

import type { MainColors } from "@/config/types";

type GridProps = {
	size?: number;
	palettes: string[];
	pixels: string[];
	onPixelsChange: (pixels: string[]) => void;
	mainColors?: MainColors;
	templates?: GridTemplate[];
};

type GridTemplate = {
	id: string;
	name: string;
	description: string;
	pixels: string[];
};

type PalettePickerProps = {
	palettes: string[];
	colorUsage: Record<string, number>;
	selectedColor: string;
	onSelectColor: (color: string) => void;
	onReplaceColor: (fromColor: string, toColor: string) => void;
};

type GridTemplatePickerProps = {
	templates: GridTemplate[];
	activeTemplateId?: string;
	onApplyTemplate: (template: GridTemplate) => void;
};

type PixelCanvasProps = {
	size: number;
	brushSize: number;
	pixels: string[];
	onBeginStroke: () => void;
	onPaintPixel: (index: number) => void;
};

type BrushSizeControlProps = {
	brushSize: number;
	maxBrushSize: number;
	onBrushSizeChange: (brushSize: number) => void;
};

type GridHistoryControlsProps = {
	canPaint: boolean;
	canUndo: boolean;
	canRedo: boolean;
	canReset: boolean;
	onUndo: () => void;
	onRedo: () => void;
	onReset: () => void;
};

export type {
	BrushSizeControlProps,
	GridTemplate,
	GridTemplatePickerProps,
	GridHistoryControlsProps,
	GridProps,
	PalettePickerProps,
	PixelCanvasProps,
};

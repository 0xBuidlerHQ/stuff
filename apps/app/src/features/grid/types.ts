type GridProps = {
	size?: number;
	palettes: string[];
	pixels: string[];
	onPixelsChange: (pixels: string[]) => void;
};

type PalettePickerProps = {
	palettes: string[];
	selectedColor: string;
	onSelectColor: (color: string) => void;
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
	GridHistoryControlsProps,
	GridProps,
	PalettePickerProps,
	PixelCanvasProps,
};

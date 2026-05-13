"use client";

import type { PalettePickerProps } from "@/features/grid/types";
import { cn } from "@/utils";

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

export { PalettePicker };

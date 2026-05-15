"use client";

import { useMemo, useState } from "react";
import type { PalettePickerProps } from "@/features/grid/types";
import { cn } from "@/utils";

const PalettePicker = ({
	palettes,
	colorUsage,
	selectedColor,
	onSelectColor,
	onReplaceColor,
}: PalettePickerProps) => {
	const selectedLabel = selectedColor.toUpperCase();
	const [replaceSource, setReplaceSource] = useState<string | null>(null);
	const usedColorsCount = useMemo(
		() => Object.values(colorUsage).filter((count) => count > 0).length,
		[colorUsage],
	);

	const selectedColorCount = colorUsage[selectedColor] ?? 0;

	const handleSwatchClick = (color: string) => {
		if (replaceSource && replaceSource !== color) {
			onReplaceColor(replaceSource, color);
			onSelectColor(color);
			setReplaceSource(null);
			return;
		}

		onSelectColor(color);
	};

	return (
		<div className="grid w-full gap-3 rounded-2xl border border-border bg-background px-3 py-3">
			<div className="flex items-center justify-between gap-4 border-b border-border/70 pb-3">
				<div className="grid gap-1">
					<div className="text-[10px] font-unbounded uppercase text-muted-foreground">Palette</div>
					<div className="text-xs text-foreground/80">
						{palettes.length} colors, {usedColorsCount} used.
					</div>
				</div>

				<div className="flex items-center gap-2 rounded-full border border-border/80 bg-muted px-2 py-2">
					<div
						className="size-6 rounded-full border border-border shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
						style={{ backgroundColor: selectedColor }}
					/>
					<div className="text-[11px] font-medium  text-foreground/85">{selectedLabel}</div>
					<button
						type="button"
						disabled={!replaceSource && selectedColorCount === 0}
						className={cn(
							"rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-foreground/80 transition hover:bg-muted",
							replaceSource &&
								"border-foreground bg-foreground text-background hover:bg-foreground",
							!replaceSource &&
								selectedColorCount === 0 &&
								"cursor-not-allowed border-border/50 bg-muted/20 text-muted-foreground/60 hover:bg-muted/20",
						)}
						onClick={() =>
							setReplaceSource((current) => (current === selectedColor ? null : selectedColor))
						}
					>
						{replaceSource === selectedColor ? "Cancel swap" : "Swap"}
					</button>
				</div>
			</div>

			<div className="grid grid-cols-5 gap-1 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-10">
				{palettes.map((color) => {
					const isSelected = selectedColor === color;
					const isReplaceSource = replaceSource === color;
					const usageCount = colorUsage[color] ?? 0;

					return (
						<button
							key={color}
							type="button"
							aria-label={`Select ${color}`}
							aria-pressed={isSelected}
							title={color.toUpperCase()}
							className={cn(
								"group relative aspect-square w-full rounded-xl border border-border/80 transition duration-150 outline-offset-2 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground",
								isSelected && "border-foreground shadow-[0_0_0_1px_var(--foreground)]",
								isReplaceSource &&
									"border-foreground bg-background shadow-[0_0_0_2px_var(--foreground)]",
							)}
							style={{ backgroundColor: color }}
							onClick={() => handleSwatchClick(color)}
						>
							<span
								className={cn(
									"pointer-events-none absolute left-2 top-2 rounded-full bg-background/85 px-1.5 py-0.5 text-[10px] font-medium text-foreground shadow-sm",
									usageCount === 0 && "opacity-55",
								)}
							>
								{usageCount}
							</span>
							<span
								className={cn(
									"pointer-events-none absolute inset-x-2 bottom-2 h-1 rounded-full bg-white/55 opacity-0 transition",
									isSelected && "opacity-100",
								)}
							/>
							{isReplaceSource ? (
								<span className="pointer-events-none absolute inset-x-2 bottom-4 rounded-full bg-background/85 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-foreground shadow-sm">
									From
								</span>
							) : null}
						</button>
					);
				})}
			</div>
		</div>
	);
};

export { PalettePicker };

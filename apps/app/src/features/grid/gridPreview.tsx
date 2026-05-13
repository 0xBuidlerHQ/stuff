import { CANVAS_SIZE } from "@/features/grid/utils";
import { cn } from "@/utils";

type GridPreviewProps = {
	size?: number;
	pixels: string[];
	className?: string;
};

const GridPreview = ({ size = CANVAS_SIZE, pixels, className }: GridPreviewProps) => {
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

export { GridPreview };

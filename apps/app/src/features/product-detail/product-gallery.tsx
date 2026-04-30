"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";

type ProductGalleryProps = {
	images: StaticImageData[];
	sku: string;
};

const ProductGallery = ({ images, sku }: ProductGalleryProps) => {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	const activeIndex = hoveredIndex ?? selectedIndex;
	const activeImage = images[activeIndex];

	return (
		<div className="grid h-full min-h-0 gap-4 desktop:grid-cols-[88px_minmax(0,1fr)]">
			<div className="order-2 flex gap-2 overflow-x-auto pb-2 desktop:order-1 desktop:grid desktop:auto-rows-min desktop:content-start desktop:justify-items-start desktop:gap-2 desktop:self-start desktop:overflow-y-auto desktop:pb-0">
				{images.map((image, index) => {
					const isActive = index === activeIndex;

					return (
						<button
							key={`${sku}-thumb-${index}`}
							type="button"
							className={[
								"relative shrink-0 overflow-hidden border bg-background transition",
								"aspect-square size-16 desktop:size-22",
								isActive ? "border-foreground" : "border-border hover:border-foreground/60",
							].join(" ")}
							onClick={() => setSelectedIndex(index)}
							onFocus={() => setHoveredIndex(index)}
							onBlur={() => setHoveredIndex(null)}
							onMouseEnter={() => setHoveredIndex(index)}
							onMouseLeave={() => setHoveredIndex(null)}
						>
							<Image fill className="object-cover" src={image} alt={sku} sizes="88px" priority />
						</button>
					);
				})}
			</div>

			<div className="order-1 flex min-h-0 items-center justify-center overflow-hidden border border-border bg-background p-4 desktop:order-2">
				{activeImage ? (
					<Image
						className="h-full w-full max-h-full object-contain"
						src={activeImage}
						alt={sku}
						priority
					/>
				) : null}
			</div>
		</div>
	);
};

export { ProductGallery };

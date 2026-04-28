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

	if (!images.length) {
		return null;
	}

	return (
		<div className="grid gap-4 desktop:grid-cols-[88px_minmax(0,1fr)]">
			<div className="order-2 grid gap-2 desktop:order-1">
				{images.map((image, index) => {
					const isActive = index === activeIndex;

					return (
						<button
							key={`${sku}-thumb-${index}`}
							type="button"
							className={[
								"overflow-hidden border bg-background transition",
								isActive ? "border-foreground" : "border-border hover:border-foreground/60",
							].join(" ")}
							onClick={() => setSelectedIndex(index)}
							onFocus={() => setHoveredIndex(index)}
							onBlur={() => setHoveredIndex(null)}
							onMouseEnter={() => setHoveredIndex(index)}
							onMouseLeave={() => setHoveredIndex(null)}
						>
							<Image className="aspect-square w-full object-cover" src={image} alt={sku} />
						</button>
					);
				})}
			</div>

			<div className="order-1 flex min-h-[360px] items-center justify-center overflow-hidden border border-border bg-background p-4 desktop:order-2">
				{activeImage ? (
					<Image
						className="h-full w-full max-h-[72vh] object-contain"
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

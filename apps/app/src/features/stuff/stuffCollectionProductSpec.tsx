"use client";

import Image from "next/image";
import Img from "@/app/icon.svg";
import type { StuffCollection } from "@/config/types";
import { Box } from "@/primitives/box";

type StuffCollectionProductSpecProps = {
	stuffCollection: StuffCollection;
};

const StuffCollectionProductSpec = ({ stuffCollection }: StuffCollectionProductSpecProps) => {
	const { material, provenance, priceBreakdown } = stuffCollection.assets.productSpecs;

	return (
		<Box className="flex flex-col p-4 bg-muted gap-4">
			<Box className="flex flex-col gap-1">
				<Box className="flex items-center gap-2">
					<Image src={Img} alt="" className="size-6" priority />
					<h1 className="text-lg font-unbounded uppercase">Product Spec</h1>
				</Box>

				<div className="text-sm text-muted-foreground">
					{"///"} A closer read on the product itself.
				</div>
			</Box>

			<Box className="flex flex-col gap-2">
				<Box className="grid gap-3 border bg-background p-4">
					<div className="font-unbounded uppercase">Material</div>
					<div className="grid gap-1">
						{material.map((item) => (
							<div key={item} className="flex items-center gap-2">
								<div className="text-lg leading-0 text-orange-500">+</div>
								<div className="text-xs text-muted-foreground">{item}</div>
							</div>
						))}
					</div>
				</Box>

				<Box className="grid gap-3 border bg-background p-4">
					<div className="font-unbounded uppercase">Provenance</div>
					<div className="grid gap-1">
						{provenance.map((item) => (
							<div key={item} className="flex items-center gap-2">
								<div className="text-lg leading-0 text-pink-500">+</div>
								<div className="text-xs text-muted-foreground">{item}</div>
							</div>
						))}
					</div>
				</Box>

				<Box className="grid gap-3 border bg-background p-4">
					<div className="font-unbounded uppercase">Price Breakdown</div>
					<div className="grid gap-1">
						{priceBreakdown.map((item) => (
							<div key={item.label} className="flex items-center justify-between gap-4">
								<Box className="flex items-center gap-2">
									<div className="text-lg leading-0 text-cyan-500">-</div>
									<div className="text-xs text-muted-foreground">{item.label}</div>
								</Box>
								<div className="text-xs text-muted-foreground">{item.value}</div>
							</div>
						))}
					</div>
				</Box>
			</Box>
		</Box>
	);
};

export { StuffCollectionProductSpec };

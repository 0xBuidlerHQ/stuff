import type { StaticImageData } from "next/image";

import stuff00000Img from "./stuff-00000/img.png";

type StuffAssets = {
	images: StaticImageData[];
	description: string;
	information: string[][];
	productSpecs: {
		material: string[];
		provenance: string[];
		priceBreakdown: Array<{ label: string; value: string }>;
	};
};

const stuffAssetsBySku: Record<string, StuffAssets> = {
	"stuff-00000": {
		images: [
			stuff00000Img,
			stuff00000Img,
			stuff00000Img,
			stuff00000Img,
			stuff00000Img,
			stuff00000Img,
			stuff00000Img,
			stuff00000Img,
			stuff00000Img,
		],
		description:
			"This short-sleeve essential features a clean, classic silhouette with a comfortable regular fit and a timeless crew neckline.",
		information: [
			//
			["80% Cotton"],
		],
		productSpecs: {
			material: [
				"80% combed cotton / 20% recycled polyester jersey",
				"Midweight knit with a soft handfeel and stable drape",
				"Pre-washed finish to reduce shrinkage after the first wear",
			],
			provenance: [
				"Knitted from yarn selected for everyday durability and a smooth print surface",
				"Cut and sewn in small-batch production runs with measured quality control",
				"Finished, packed, and prepared for customization before final release",
			],
			priceBreakdown: [
				{ label: "Blank garment", value: "$0.42" },
				{ label: "Cut, sew, and finishing", value: "$0.19" },
				{ label: "Customization prep", value: "$0.14" },
				{ label: "Packaging and handling", value: "$0.10" },
				{ label: "Studio operations", value: "$0.15" },
				{ label: "Profit", value: "$10" },
			],
		},
	},
};

const getStuffAssets = (sku: string): StuffAssets | undefined => {
	return stuffAssetsBySku[sku];
};

export type { StuffAssets };
export { getStuffAssets, stuffAssetsBySku };

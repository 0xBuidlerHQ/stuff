import type { StaticImageData } from "next/image";

import stuff00000Img from "./stuff-00000/img.png";

type ProductAssets = {
	images: StaticImageData[];
	description: string;
	information: string[][];
};

const productAssetsBySku = {
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
			"This short-sleeve essential features a clean, classic silhouette with a comfortable regular fit and a timeless crew neckline. Crafted from a soft, breathable cotton blend, it feels light on the skin while holding its shape through daily wear. The fabric has a smooth finish, making it easy to dress up or keep casual. Designed for versatility, it pairs just as well with denim as it does layered under a jacket. An everyday staple, refined just enough to stand on its own.",
		information: [
			//
			["80% Cotton"],
		],
	},
} satisfies Record<string, ProductAssets>;

const getProductAssets = (sku: string): ProductAssets | undefined => {
	return productAssetsBySku[sku];
};

export type { ProductAssets };
export { getProductAssets, productAssetsBySku };

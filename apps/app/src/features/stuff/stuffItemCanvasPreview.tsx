"use client";

import { GridPreview } from "@/features/grid/gridPreview";
import { useStuffEcosystem } from "@/providers/stuff-ecosystem";

type StuffItemCanvasPreviewProps = {
	canvas: string[];
};

const StuffItemCanvasPreview = ({ canvas }: StuffItemCanvasPreviewProps) => {
	const { decodeCanvasToPixels } = useStuffEcosystem();

	return <GridPreview pixels={decodeCanvasToPixels(canvas)} />;
};

export { StuffItemCanvasPreview };

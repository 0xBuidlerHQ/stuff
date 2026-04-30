"use client";

import { Center, Float } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Model } from "@/assets/stuff-00000/model";
import { Box } from "@/primitives/box";
import { SceneEnvironments } from "./primitives/environments";
import { SceneLights } from "./primitives/lights";
import { SceneOverlay } from "./primitives/overlay";
import { SceneTools } from "./primitives/tools";

type ScenePrimitiveProps = {
	sku: string;
};

type ProductSceneProps = {
	sku: string;
};

const ScenePrimitive = ({ sku }: ScenePrimitiveProps) => {
	return (
		<Float>
			<Center>
				<Model rotation={[0, 3.1, 0]} sku={sku} />
			</Center>
		</Float>
	);
};

const ProductScene = ({ sku }: ProductSceneProps) => {
	return (
		<Box className="relative h-full w-full">
			<SceneOverlay />

			<Canvas shadows camera={{ position: [0, 0, 0.75] }} className="h-full w-full">
				<ScenePrimitive sku={sku} />
				<SceneLights />
				<SceneTools />
				<SceneEnvironments />
			</Canvas>
		</Box>
	);
};

export { ProductScene };

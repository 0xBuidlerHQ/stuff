"use client";

import { ContactShadows } from "@react-three/drei";

const SceneEnvironments = () => {
	return (
		<ContactShadows
			blur={2}
			color="#0f172a"
			far={10}
			opacity={0.6}
			position={[0, -2.5, 0]}
			resolution={1024}
			scale={12}
		/>
	);
};

export { SceneEnvironments };

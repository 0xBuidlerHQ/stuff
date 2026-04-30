"use client";

const SceneLights = () => {
	return (
		<>
			<ambientLight intensity={0.5} />

			<directionalLight
				castShadow
				color="#fff7ed"
				intensity={1.4}
				position={[0, 0, -10]}
				shadow-mapSize-height={2048}
				shadow-mapSize-width={2048}
			/>

			<directionalLight
				castShadow
				color="#fff7ed"
				intensity={1.4}
				position={[0, 0, 10]}
				shadow-mapSize-height={2048}
				shadow-mapSize-width={2048}
			/>

			<directionalLight color="#dbeafe" intensity={0.45} position={[-6, 3, 4]} />

			<pointLight color="#f8fafc" intensity={0.35} position={[0, 2, 8]} />
			<pointLight color="#c4b5fd" intensity={0.25} position={[0, 4, -6]} />
		</>
	);
};

export { SceneLights };

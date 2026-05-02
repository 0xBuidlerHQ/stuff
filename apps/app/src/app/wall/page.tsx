import { getFactoryProjects } from "@/features/product-catalog";
import { getWallPieces, ProductWallSection } from "@/features/product-wall";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";

const Page = async () => {
	const projects = await getFactoryProjects();
	const projectsWithPieces = await Promise.all(
		projects.map(async (project) => ({
			...project,
			pieces: await getWallPieces(project.stuffAddress, project.collection),
		})),
	);

	return (
		<Container>
			<Box className="grid gap-12">
				{projectsWithPieces.map((project) => (
					<ProductWallSection
						key={project.stuffAddress}
						collection={project.collection}
						pieces={project.pieces}
						slug={project.slug}
					/>
				))}
			</Box>
		</Container>
	);
};

export default Page;

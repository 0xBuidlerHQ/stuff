import type { StuffERC721 } from "@0xhq/stuff.contracts/types.user";
import { getProjectCollection } from "@/features/getCollection";
import { Grid } from "@/features/grid";
import { getProject, projectSlugs } from "@/features/projects";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";

const GRID_SIZE = 32;
const CELL_SIZE = 16;

export const dynamicParams = false;

export const generateStaticParams = () => {
	return projectSlugs.map((slug) => ({ slug }));
};

type PageProps = { params: Promise<{ slug: string }> };

const PageItem = (props: StuffERC721.StuffCollection) => {
	return (
		<Box>
			<Box className="flex items-baseline">
				<h1 className="text-4xl">{props.name}</h1>
				<h4 className="text-xs">#{props.sku}</h4>
			</Box>
		</Box>
	);
};

const Page = async ({ params }: PageProps) => {
	const { slug } = await params;
	const project = getProject(slug);

	const projectCollection = await getProjectCollection(project);

	return (
		<Container className="py-10">
			<PageItem {...projectCollection} />

			<Box className="grid grid-cols-12">
				<Box className="col-span-6">Scene</Box>

				<Box className="col-span-6">
					<Grid size={GRID_SIZE} cellSize={CELL_SIZE} palettes={projectCollection.palette} />
				</Box>
			</Box>
		</Container>
	);
};

export default Page;

import { StuffCollections } from "@/features/stuff/stuffCollections";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";
import { getStuffCollections } from "@/queries/getStuffCollections";

const Page = async () => {
	const stuffCollections = await getStuffCollections();

	return (
		<Container>
			<Box className="grid grid-cols-4 mobile:grid-cols-1 gap-4">
				<StuffCollections stuffCollections={stuffCollections} />
			</Box>
		</Container>
	);
};

export default Page;

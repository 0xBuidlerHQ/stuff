import { StuffCollectionGallery } from "@/features/stuff/stuffCollectionGallery";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";
import { getStuffCollections } from "@/queries/getStuffCollections";

const StuffsPage = async () => {
	const stuffCollections = await getStuffCollections();

	return (
		<Container>
			<Box className="grid grid-cols-4 mobile:grid-cols-1 gap-4">
				<StuffCollectionGallery stuffCollections={stuffCollections} />
			</Box>
		</Container>
	);
};

export default StuffsPage;

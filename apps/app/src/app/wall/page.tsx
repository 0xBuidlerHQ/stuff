import { StuffWallSection } from "@/features/stuff-wall/wall";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";

const Page = async () => {
	const stuffCollections = await getStuff();

	return (
		<Container>
			<Box className="grid gap-12">
				{stuffSections.map(({ stuff, pieces }) => (
					<StuffWallSection key={stuff.address} stuff={stuff} pieces={pieces} />
				))}
			</Box>
		</Container>
	);
};

export default Page;

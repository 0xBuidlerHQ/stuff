import { StuffWall } from "@/features/stuff-wall/wall";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";

const Page = () => {
	return (
		<Container>
			<Box className="text-8xl">WALL</Box>

			<StuffWall />
		</Container>
	);
};

export default Page;

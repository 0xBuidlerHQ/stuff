import { env } from "@/config/env";
import { getStuffs } from "@/features/stuff/getStuffs";
import { getWallPieces } from "@/features/stuff-wall/get-wall-pieces";
import { StuffWallSection } from "@/features/stuff-wall/wall";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";

const Page = async () => {
	const stuffs = await getStuffs({ chainId: env.CHAIN_ID as any });
	const stuffSections = await Promise.all(
		stuffs.map(async (stuff) => ({
			stuff,
			pieces: await getWallPieces(stuff),
		})),
	);

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

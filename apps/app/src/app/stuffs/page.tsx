import { env } from "@/config/env";
import { getStuffs } from "@/features/stuff/getStuffs";
import { Stuff } from "@/features/stuff/stuff";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";

const StuffsPage = async () => {
	const stuffs = await getStuffs({ chainId: env.CHAIN_ID as any });

	return (
		<Container>
			<Box className="grid grid-cols-4 mobile:grid-cols-1 gap-4">
				{stuffs.map((stuff) => (
					<Stuff key={stuff.id} stuff={stuff} />
				))}
			</Box>
		</Container>
	);
};

export default StuffsPage;

import { CartPage } from "@/features/cart/page";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";
import { getStuffCollections } from "@/queries/getStuffCollections";

const Page = async () => {
	const stuffCollections = await getStuffCollections();

	return (
		<Container>
			<Box className="text-8xl">CART</Box>

			<CartPage stuffCollections={stuffCollections} />
		</Container>
	);
};

export default Page;

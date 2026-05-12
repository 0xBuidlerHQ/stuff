import { CheckoutPage } from "@/features/checkout/page";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";
import { getStuffCollections } from "@/queries/getStuffCollections";

const Page = async () => {
	const stuffCollections = await getStuffCollections();

	return (
		<Container>
			<Box className="text-8xl">CHECKOUT</Box>

			<CheckoutPage stuffCollections={stuffCollections} />
		</Container>
	);
};

export default Page;

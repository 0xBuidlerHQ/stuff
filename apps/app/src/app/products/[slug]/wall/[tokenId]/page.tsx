import { redirect } from "next/navigation";

const Page = async ({
	params,
}: {
	params: Promise<{ slug: string; tokenId: string }>;
}) => {
	const { slug, tokenId } = await params;

	redirect(`/wall/${slug}/${tokenId}`);
};

export default Page;

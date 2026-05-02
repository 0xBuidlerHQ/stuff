import { redirect } from "next/navigation";

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
	const { slug } = await params;

	redirect(`/wall/${slug}`);
};

export default Page;

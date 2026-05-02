import { notFound } from "next/navigation";
import { env } from "@/config/env";
import { getWallPieces, ProductWall } from "@/features/product-wall";
import { getStuffs } from "@/features/stuff/getStuffs";

export const dynamicParams = false;
export const generateStaticParams = async () => {
	const stuffs = await getStuffs({ chainId: env.CHAIN_ID as any });
	return stuffs.map((stuff) => ({ slug: stuff.slug }));
};

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
	const { slug } = await params;
	const stuffs = await getStuffs({ chainId: env.CHAIN_ID as any });
	const project = stuffs.find((stuff) => stuff.slug === slug);

	if (!project) notFound();

	const pieces = await getWallPieces(project.stuffAddress, project.collection);

	return <ProductWall collection={project.collection} pieces={pieces} slug={project.slug} />;
};

export default Page;

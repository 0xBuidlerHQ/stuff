import { notFound } from "next/navigation";
import { env } from "@/config/env";
import { getWallPieces } from "@/features/stuff-wall/get-wall-pieces";
import { StuffWall } from "@/features/stuff-wall/wall";
import { getStuffs } from "@/features/stuff/getStuffs";

export const dynamicParams = false;
export const generateStaticParams = async () => {
	const stuffs = await getStuffs({ chainId: env.CHAIN_ID as any });
	return stuffs.map((stuff) => ({ slug: stuff.slug }));
};

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
	const { slug } = await params;
	const stuffs = await getStuffs({ chainId: env.CHAIN_ID as any });
	const stuff = stuffs.find((item) => item.slug === slug);

	if (!stuff) notFound();

	const pieces = await getWallPieces(stuff.address, stuff.blueprint);

	return <StuffWall stuff={stuff} pieces={pieces} />;
};

export default Page;

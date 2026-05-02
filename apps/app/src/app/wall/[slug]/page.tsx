import { notFound } from "next/navigation";
import { getFactoryProjects } from "@/features/product-catalog";
import { getWallPieces, ProductWall } from "@/features/product-wall";

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
	const { slug } = await params;
	const projects = await getFactoryProjects();
	const project = projects.find((item) => item.slug === slug);

	if (!project) notFound();

	const pieces = await getWallPieces(project.stuffAddress, project.collection);

	return <ProductWall collection={project.collection} pieces={pieces} slug={project.slug} />;
};

export default Page;

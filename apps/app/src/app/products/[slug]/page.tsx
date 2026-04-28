import { getFactoryProjects } from "@/features/getFactoryProjects";
import { ProductCustomizationPanel } from "@/features/product-customization-panel";
import { ProductGallery } from "@/features/product-gallery";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";

export const dynamicParams = false;
export const generateStaticParams = async () => {
	const projects = await getFactoryProjects();
	return projects.map((project) => ({ slug: project.slug }));
};

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
	const { slug } = await params;
	const projects = await getFactoryProjects();
	const project = projects.find((item) => item.slug === slug);

	if (!project) throw new Error(`Unknown project slug: ${slug}`);

	const projectCollection = project.collection;

	return (
		<Container>
			<div className="grid gap-6 desktop:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] desktop:items-start">
				<div className="min-w-0 desktop:sticky desktop:top-0 desktop:self-start">
					<Box className="grid gap-6">
						<Box className="flex flex-col gap-1">
							<h1 className="text-sm text-muted-foreground">/{projectCollection.category}</h1>
							<h1 className="text-4xl">{projectCollection.sku}</h1>
							<h1 className="text-xs text-muted-foreground">
								&nbsp;&nbsp;{project.assets.description}
							</h1>
						</Box>

						<ProductGallery images={project.assets?.images ?? []} sku={project.collection.sku} />
					</Box>
				</div>

				<div className="min-w-0 desktop:pr-2">
					<ProductCustomizationPanel
						sku={projectCollection.sku}
						palette={projectCollection.palette}
						options={projectCollection.options}
					/>
				</div>
			</div>
		</Container>
	);
};

export default Page;

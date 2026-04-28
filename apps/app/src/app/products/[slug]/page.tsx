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
				<div className="min-w-0 desktop:sticky desktop:top-0 desktop:h-screen desktop:self-start">
					<Box className="grid h-full min-h-0 gap-6 overflow-hidden">
						<Box className="flex flex-col gap-1">
							<h1 className="text-sm text-muted-foreground">/{projectCollection.category}</h1>
							<h1 className="text-4xl">{projectCollection.sku}</h1>
							<h1 className="text-xs text-muted-foreground">
								&nbsp;&nbsp;{project.assets.description}
							</h1>
						</Box>

						<div className="min-h-0">
							<ProductGallery images={project.assets?.images ?? []} sku={project.collection.sku} />
						</div>
					</Box>
				</div>

				<div className="min-w-0 desktop:pr-2 bg-muted/50 p-4">
					<Box className="grid gap-6">
						<Box className="flex flex-col gap-1">
							<h1 className="text-4xl">Customization</h1>
							<h1 className="text-xs text-muted-foreground">
								&nbsp;&nbsp;Refine every detail to reflect your vision. Select finishes, adjust
								elements, and personalize your piece with care and precision, shaping a creation
								that feels intentional and distinctive. Every choice contributes to something
								uniquely yours, considered down to the smallest detail.
							</h1>
						</Box>

						<ProductCustomizationPanel
							palette={projectCollection.palette}
							options={projectCollection.options}
						/>
					</Box>
				</div>
			</div>
		</Container>
	);
};

export default Page;

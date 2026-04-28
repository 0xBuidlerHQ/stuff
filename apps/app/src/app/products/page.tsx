import Image from "next/image";
import { links } from "@/config/links";
import { type FactoryProject, getFactoryProjects } from "@/features/getFactoryProjects";
import { Box } from "@/primitives/box";
import { Button } from "@/primitives/button";
import { Container } from "@/primitives/container";

const Homepage = async () => {
	const projects = await getFactoryProjects();

	const projectsByCategory = projects.reduce<Record<string, FactoryProject[]>>((acc, project) => {
		const category = project.collection.category;
		acc[category] ??= [];
		acc[category].push(project);
		return acc;
	}, {});

	return (
		<Container>
			<div className="grid gap-6">
				{Object.entries(projectsByCategory).map(([category, items]) => (
					<Box key={category} className="grid gap-4">
						<Box className="text-sm text-muted-foreground">/{category}</Box>
						<Box className="grid gap-4">
							{items.map((item) => (
								<Box
									key={item.stuffAddress}
									className="bg-background transition hover:bg-muted/40 p-4"
								>
									<Button href={`${links.products.url}/${item.slug}`}>
										<Box className="flex gap-2">
											<Image
												className="size-42 shrink-0 border border-border object-cover aspect-square"
												src={item.assets.images[0]}
												alt={item.collection.sku}
											/>

											<Box className="flex min-w-0 flex-1 flex-col justify-between gap-2 py-1">
												<Box className="grid gap-1">
													<Box className="text-xl leading-tight">{item.collection.sku}</Box>
												</Box>
											</Box>
										</Box>
									</Button>
								</Box>
							))}
						</Box>
					</Box>
				))}
			</div>
		</Container>
	);
};

export default Homepage;

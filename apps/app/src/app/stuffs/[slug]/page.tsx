import { Beaut } from "@0xhq/beaut";

import Image from "next/image";
import { notFound } from "next/navigation";

import Img from "@/app/icon.svg";
import { StuffCollectionImageGallery } from "@/features/stuff/stuffCollectionImageGallery";
import { StuffItemConfigurator } from "@/features/stuff/stuffItemConfigurator";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";
import { getStuffCollections } from "@/queries/getStuffCollections";

export const dynamicParams = false;

export const generateStaticParams = async () => {
	const stuffCollections = await getStuffCollections();
	return stuffCollections.map((stuffCollection) => ({ slug: stuffCollection.slug }));
};

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
	const { slug } = await params;

	const stuffCollections = await getStuffCollections();
	const stuffCollection = stuffCollections.find((stuffCollection) => stuffCollection.slug === slug);

	if (!stuffCollection) notFound();

	return (
		<Container>
			<Box className="grid gap-6 desktop:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] desktop:items-start">
				<Box className="min-w-0 desktop:sticky desktop:top-0 desktop:self-start">
					<Box className="grid h-full min-h-0 gap-6 overflow-hidden">
						<Box className="flex flex-col gap-2">
							<Box className="flex items-center justify-between gap-4">
								<Box className="flex items-center gap-2">
									<h1 className="text-5xl">{stuffCollection.sku}</h1>
								</Box>

								<Box>
									<h1 className="text-2xl pl-1 pr-2 pt-1 bg-foreground text-background inline">
										{Beaut.money(Number(Beaut.bigint(stuffCollection.mintPriceToken, 6)))}
									</h1>
								</Box>
							</Box>

							<h1 className="text-xs text-muted-foreground">
								&nbsp;&nbsp;{stuffCollection.assets.description}
							</h1>
						</Box>

						<StuffCollectionImageGallery stuffCollection={stuffCollection} />
					</Box>
				</Box>

				<Box className="min-w-0 desktop:pr-2 bg-muted p-4">
					<Box className="grid gap-6">
						<Box className="flex flex-col gap-4">
							<Box className="flex items-center gap-2">
								<Image src={Img} alt="" className="size-6" priority />
								<h1 className="text-lg font-unbounded uppercase">Customization</h1>
							</Box>

							<h1 className="text-xs text-muted-foreground">
								&nbsp;&nbsp;Refine every detail to reflect your vision. Select finishes, adjust
								elements, and personalize your piece with care and precision, shaping a creation
								that feels intentional and distinctive. Every choice contributes to something
								uniquely yours, considered down to the smallest detail.
							</h1>
						</Box>

						<StuffItemConfigurator stuffCollection={stuffCollection} />
					</Box>
				</Box>
			</Box>
		</Container>
	);
};

export default Page;

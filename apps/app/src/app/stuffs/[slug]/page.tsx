import { Beaut } from "@0xhq/beaut";

import Image from "next/image";
import { notFound } from "next/navigation";

import Img from "@/app/icon.svg";
import { env } from "@/config/env";
import { StuffConfigurator } from "@/features/stuff-configurator/stuff-configurator";

import { getStuffs } from "@/features/stuff/getStuffs";
import { StuffGallery } from "@/features/stuff/stuffGallery";

import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";

export const dynamicParams = false;

export const generateStaticParams = async () => {
	const stuffs = await getStuffs({ chainId: env.CHAIN_ID as any });
	return stuffs.map((stuff) => ({ slug: stuff.slug }));
};

const StuffPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
	const { slug } = await params;

	const stuffs = await getStuffs({ chainId: env.CHAIN_ID as any });
	const stuff = stuffs.find((stuff) => stuff.slug === slug);

	if (!stuff) notFound();

	return (
		<Container>
			<Box className="grid gap-6 desktop:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] desktop:items-start">
				<Box className="min-w-0 desktop:sticky desktop:top-0 desktop:h-screen desktop:self-start">
					<Box className="grid h-full min-h-0 gap-6 overflow-hidden">
						<Box className="flex flex-col gap-2">
							<Box className="flex items-center justify-between gap-4">
								<Box className="flex items-center gap-2">
									<h1 className="text-5xl">{stuff.blueprint.sku}</h1>
								</Box>

								<Box>
									<h1 className="text-2xl pl-1 pr-2 pt-1 bg-foreground text-background inline">
										{Beaut.money(Number(Beaut.bigint(stuff.blueprint.mintPriceToken, 6)))}
									</h1>
								</Box>
							</Box>

							<h1 className="text-xs text-muted-foreground">
								&nbsp;&nbsp;{stuff.assets.description}
							</h1>
						</Box>

						<StuffGallery stuff={stuff} />
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

						<StuffConfigurator stuff={stuff} />
					</Box>
				</Box>
			</Box>
		</Container>
	);
};

export default StuffPage;

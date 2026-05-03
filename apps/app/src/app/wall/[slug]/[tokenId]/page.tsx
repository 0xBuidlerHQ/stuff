import { Beaut } from "@0xhq/beaut";
import { stuffErc721Config } from "@0xhq/stuff.contracts";
import type { StuffERC721 } from "@0xhq/stuff.contracts/types.user";
import { notFound } from "next/navigation";
import { readContract } from "wagmi/actions";
import { env } from "@/config/env";
import { GridPreview } from "@/features/stuff-configurator/grid";
import { decodeCanvasToPixels } from "@/features/stuff-wall/get-wall-pieces";
import { getStuffs } from "@/features/stuff/getStuffs";
import { Box } from "@/primitives/box";
import { Button } from "@/primitives/button";
import { Container } from "@/primitives/container";
import { wagmiConfig } from "@/providers/wagmi.config";

const Page = async ({
	params,
}: {
	params: Promise<{ slug: string; tokenId: string }>;
}) => {
	const { slug, tokenId: tokenIdParam } = await params;
	const stuffs = await getStuffs({ chainId: env.CHAIN_ID as any });
	const stuffCollection = stuffs.find((item) => item.slug === slug);

	if (!stuffCollection) notFound();
	if (!/^\d+$/.test(tokenIdParam)) notFound();

	const tokenId = BigInt(tokenIdParam);

	if (tokenId < BigInt(0) || tokenId >= stuffCollection.blueprint.maxSupply) {
		notFound();
	}

	const currentSupply = (await readContract(wagmiConfig(), {
		abi: stuffErc721Config.abi,
		functionName: "tokenIdsIndex",
		address: stuffCollection.address,
	})) as bigint;

	if (tokenId >= currentSupply) {
		return (
			<Container>
				<Box className="grid gap-6 border border-border bg-background p-6 desktop:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
					<Box className="grid gap-4">
						<Box className="grid gap-2">
							<Box className="text-4xl">{stuffCollection.blueprint.sku}</Box>
							<Box className="text-sm text-muted-foreground">#{tokenId.toString()}</Box>
						</Box>

						<Box className="grid gap-2">
							<Box className="text-xs uppercase text-muted-foreground">Status</Box>
							<Box className="text-2xl">Not created yet</Box>
						</Box>

						<Box className="grid gap-2 text-sm text-muted-foreground">
							<Box>This item id is in the collection range, but it has not been minted yet.</Box>
							<Box>It will appear here once token #{tokenId.toString()} is created.</Box>
						</Box>

						<Box className="grid gap-2 text-sm">
							<Meta label="Collection" value={stuffCollection.blueprint.sku} />
							<Meta label="Token" value={`#${tokenId.toString()}`} />
							<Meta label="Minted" value={currentSupply.toString()} />
							<Meta label="Max supply" value={stuffCollection.blueprint.maxSupply.toString()} />
						</Box>

						<Box className="w-fit">
							<Button
								href={`/wall/${stuffCollection.slug}`}
								className="text-sm underline underline-offset-4"
							>
								Back to wall
							</Button>
						</Box>
					</Box>

					<Box className="border border-border bg-muted/30 p-6 text-sm text-muted-foreground">
						No artwork is available for this token yet.
					</Box>
				</Box>
			</Container>
		);
	}

	const [owner, stuff] = (await Promise.all([
		readContract(wagmiConfig(), {
			abi: stuffErc721Config.abi,
			functionName: "ownerOf",
			args: [tokenId],
			address: stuffCollection.address,
		}),
		readContract(wagmiConfig(), {
			abi: stuffErc721Config.abi,
			functionName: "getStuff",
			args: [tokenId],
			address: stuffCollection.address,
		}),
	])) as [string, StuffERC721.Stuff];

	const pixels = decodeCanvasToPixels(stuff.canvas, stuffCollection.blueprint.palette);

	return (
		<Container>
			<Box className="grid gap-6 desktop:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
				<Box className="desktop:w-[min(100%,560px)]">
					<GridPreview size={42} pixels={pixels} className="border-border" />
				</Box>

				<Box className="grid gap-4">
					<Box className="grid gap-2">
						<Box className="text-4xl">
							{stuff.title || `${stuffCollection.blueprint.sku} #${tokenId.toString()}`}
						</Box>
						<Box className="text-sm text-muted-foreground">
							{stuff.description ||
								`Minted item #${tokenId.toString()} from ${stuffCollection.blueprint.sku}.`}
						</Box>
					</Box>

					<Box className="grid gap-2 text-sm">
						<Meta label="Collection" value={stuffCollection.blueprint.sku} />
						<Meta label="Category" value={stuffCollection.blueprint.category} />
						<Meta label="Author" value={stuff.author || "-"} />
						<Meta label="Owner" value={owner} breakAll />
						<Meta label="Token" value={`#${tokenId.toString()}`} />
						<Meta
							label="Mint price"
							value={Beaut.money(Number(Beaut.bigint(stuffCollection.blueprint.mintPriceToken, 6)))}
						/>
					</Box>

					<Box className="grid gap-2">
						<Box className="text-xs uppercase text-muted-foreground">Options</Box>
						<Box className="grid gap-2">
							{stuff.options.map(([name, value]) => (
								<Box key={`${name}-${value}`} className="flex gap-3 border-b border-muted pb-2 text-sm">
									<Box className="capitalize text-muted-foreground">{name}</Box>
									<Box>{value}</Box>
								</Box>
							))}
						</Box>
					</Box>
				</Box>
			</Box>
		</Container>
	);
};

const Meta = ({ label, value, breakAll }: { label: string; value: string; breakAll?: boolean }) => (
	<Box className="grid gap-1">
		<Box className="text-xs uppercase text-muted-foreground">{label}</Box>
		<Box className={breakAll ? "break-all" : undefined}>{value}</Box>
	</Box>
);

export default Page;

import { externalLinks } from "@/config/links";
import { Box } from "@/primitives/box";
import { Button } from "@/primitives/button";
import { FooterPrimitive } from "@/primitives/footer";

type FooterCategoryProps = {
	title: string;
	links: { title: string; link: string }[];
};
const FooterCategory = (props: FooterCategoryProps) => {
	return (
		<Box className="flex flex-col gap-8">
			<Box className="text-sm">{props.title}</Box>

			<Box className="flex flex-col gap-2">
				{props.links.map((link) => {
					return (
						<Button key={link.title} href={link.title}>
							<Box className="text-xs hover:underline transition-all text-muted-foreground">
								{link.title}
							</Box>
						</Button>
					);
				})}
			</Box>
		</Box>
	);
};

const Footer = () => {
	return (
		<FooterPrimitive>
			<div className="bg-muted h-px" />

			<Box className="py-20">
				<Box className="grid grid-cols-5">
					<FooterCategory
						title="SOCIALS"
						links={[
							{ title: "X", link: externalLinks.x },
							{ title: "Telegram", link: externalLinks.telegram },
							{ title: "Github", link: externalLinks.github },
						]}
					/>
					<FooterCategory title="RESSOURCES" links={[]} />
					<FooterCategory title="HELP" links={[]} />
					<FooterCategory title="ENTERPRISE" links={[]} />
				</Box>
			</Box>
		</FooterPrimitive>
	);
};

export { Footer };

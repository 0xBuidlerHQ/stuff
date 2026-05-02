import Image from "next/image";
import Link from "next/link";
import Img from "@/app/icon.svg";
import { links } from "@/config/links";
import { ConnectButton } from "@/features/web3/connectButton";
import { WorldClock } from "@/layouts/header/world-clock";
import { Box } from "@/primitives/box";
import { Button } from "@/primitives/button";
import { HeaderPrimitive } from "@/primitives/header";

const Header = () => {
	return (
		<HeaderPrimitive>
			<Box className="py-[2px]">
				<WorldClock />
			</Box>

			<div className="bg-muted h-px" />

			<Box className="flex justify-between py-2">
				<Box className="flex items-center">
					<Link className="text-sm font-medium" href={links.home.url}>
						<Image priority className="size-10" src={Img} alt="" />
					</Link>

					<Box className="w-8 flex items-center justify-center">
						<Box className="h-4 w-px bg-muted-foreground" />
					</Box>

					<Navigation />

					<Box className="w-8 flex items-center justify-center">
						<Box className="h-4 w-px bg-muted-foreground" />
					</Box>

					<Box className="flex items-center gap-4 text-xs text-muted-foreground">
						<span className="bg-red-500 text-background px-2">
							built for a world that’s had enough.
						</span>
					</Box>
				</Box>

				<Box>
					<ConnectButton />
				</Box>
			</Box>

			<div className="bg-muted h-px" />
		</HeaderPrimitive>
	);
};

const NavigationItems = [links.products, links.wall, links.about];

const NavigationItem = (props: (typeof NavigationItems)[number]) => {
	return (
		<Button
			key={props.url}
			href={props.url}
			className="transition-all hover:bg-red-500 hover:text-background"
		>
			<Box className="text-xs px-1">{props.name}</Box>
		</Button>
	);
};

const Navigation = () => {
	return (
		<Box className="flex items-center justify-center gap-4">
			{NavigationItems.map((navigationItem) => {
				return <NavigationItem key={navigationItem.name} {...navigationItem} />;
			})}
		</Box>
	);
};

export { Header, NavigationItem };

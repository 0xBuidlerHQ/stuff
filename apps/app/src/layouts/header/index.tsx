import Image from "next/image";
import Link from "next/link";
import Img from "@/app/icon.svg";
import { links } from "@/config/links";
import { ConnectButton } from "@/features/web3/connectButton";
import { Navigation } from "@/layouts/header/navigation";
import { WorldClock } from "@/layouts/header/world-clock";
import { RouteLabel } from "@/layouts/route-label";
import { Box } from "@/primitives/box";
import { HeaderPrimitive } from "@/primitives/header";

const Header = () => {
	return (
		<HeaderPrimitive className="">
			<Box className="py-0.5">
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

					<Box className="flex items-center gap-4 text-xs bg-muted text-muted-foreground">
						<span className="px-2">built for a world that’s had enough.</span>
					</Box>
				</Box>

				<Box className="flex items-center gap-4">
					<ConnectButton />
				</Box>
			</Box>

			<div className="bg-muted h-px" />

			<RouteLabel />

			<div className="bg-muted h-px" />
		</HeaderPrimitive>
	);
};

export { Header };

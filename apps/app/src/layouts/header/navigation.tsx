"use client";

import { usePathname } from "next/navigation";
import { links } from "@/config/links";
import { Box } from "@/primitives/box";
import { Button } from "@/primitives/button";
import { cn } from "@/utils";

const NavigationItems = [links.stuffs, links.wall, links.culture, links.impact, links.about];

const isActive = (pathname: string, url: string) => {
	return pathname === url || pathname.startsWith(`${url}/`);
};

const NavigationItem = (
	props: (typeof NavigationItems)[number] & {
		isActive?: boolean;
	},
) => {
	return (
		<Button
			key={props.url}
			href={props.url}
			className={cn(
				"transition-all",
				props.isActive
					? "bg-red-500 text-background px-1"
					: "hover:bg-red-500 hover:text-background",
			)}
		>
			<Box className="text-xs px-1">{props.name}</Box>
		</Button>
	);
};

const Navigation = () => {
	const pathname = usePathname();

	return (
		<Box className="flex items-center justify-center gap-2">
			{NavigationItems.map((navigationItem) => {
				return (
					<NavigationItem
						key={navigationItem.name}
						isActive={isActive(pathname, navigationItem.url)}
						{...navigationItem}
					/>
				);
			})}
		</Box>
	);
};

export { isActive, Navigation, NavigationItem };

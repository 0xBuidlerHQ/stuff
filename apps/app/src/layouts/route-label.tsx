"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";

const RouteLabel = () => {
	const pathname = usePathname();

	if (!pathname || pathname === "/") return null;

	const segments = pathname.split("/").filter(Boolean);

	return (
		<Container>
			<Box className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
				<Box>/</Box>
				{segments.map((segment, index) => {
					const isLeaf = index === segments.length - 1;
					const href = `/${segments.slice(0, index + 1).join("/")}`;

					return (
						<Box key={href} className="flex items-center gap-1">
							{index > 0 ? <Box>/</Box> : null}
							{!isLeaf ? (
								<Link href={href} className="transition hover:text-foreground">
									{segment}
								</Link>
							) : (
								<Box>{segment}</Box>
							)}
						</Box>
					);
				})}
			</Box>
		</Container>
	);
};

export { RouteLabel };

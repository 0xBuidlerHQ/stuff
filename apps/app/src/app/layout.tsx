import "./system.css";

import type { Metadata } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { geistSans, interSans, tronicaMono, unbounded } from "@/config/fonts";
import { Footer } from "@/layouts/footer";
import { Header } from "@/layouts/header";
import { Box } from "@/primitives/box";
import { Providers } from "@/providers";
import { wagmiConfig } from "@/providers/wagmi.config";
import { cn } from "@/utils";

export const metadata: Metadata = {
	title: "CARRE",
	description: "",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const initialState = cookieToInitialState(wagmiConfig(), (await headers()).get("cookie"));

	return (
		<html
			lang="en"
			className={cn(
				"antialiased",
				tronicaMono.variable,
				geistSans.variable,
				interSans.variable,
				unbounded.variable,
			)}
		>
			<body className="grow flex flex-col min-h-dvh font-tronica-mono">
				<Providers initialState={initialState}>
					<Header />

					<main className="flex grow min-h-0">
						<Box className="grow relative">
							<Box className="py-2">{children}</Box>
						</Box>
					</main>

					<Footer />
				</Providers>
			</body>
		</html>
	);
}

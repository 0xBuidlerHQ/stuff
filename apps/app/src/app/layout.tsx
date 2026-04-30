import "./system.css";

import type { Metadata } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { geistSans, interSans, tronicaMono, unbounded } from "@/config/fonts";
import { Footer } from "@/layouts/footer";
import { Globals } from "@/layouts/globals";
import { Header } from "@/layouts/header";
import { Providers } from "@/providers";
import { wagmiConfig } from "@/providers/wagmi.config";
import { cn } from "@/utils";

export const metadata: Metadata = {
	title: "Echo Project",
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
						<div className="grow relative">{children}</div>
					</main>

					<Footer />

					{/*  */}
					<Globals />
				</Providers>
			</body>
		</html>
	);
}

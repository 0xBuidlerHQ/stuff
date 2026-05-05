import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		externalDir: true,
	},
	transpilePackages: ["@0xhq/stuff.contracts", "@0xhq/stuff.subgraph"],
	turbopack: {
		root: path.resolve(process.cwd(), "../.."),
	},
};

export default nextConfig;

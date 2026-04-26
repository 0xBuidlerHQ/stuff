import { defineConfig } from "@wagmi/cli";
import { foundry } from "@wagmi/cli/plugins";

import deployments from "./deployments/deployments.json";

export default defineConfig({
	out: "package/index.tsx",
	plugins: [
		foundry({
			project: ".",
			deployments: deployments as any,
		}),
	],
});

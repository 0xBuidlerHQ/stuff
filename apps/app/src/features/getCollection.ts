import type { StuffERC721 } from "@0xhq/stuff.contracts/types.user";
import { cache } from "react";
import { readContract } from "wagmi/actions";
import type { ProjectSlugs } from "@/features/projects";
import { wagmiConfig } from "@/providers/wagmi.config";

export const getProjectCollection = cache(async (project: ProjectSlugs) => {
	return readContract(wagmiConfig(), {
		abi: project.product.web3.config.abi,
		functionName: "getCollection",
		address: project.product.web3.config.address["8453"],
	}) as unknown as StuffERC721.StuffCollection;
});

"use client";

import { useWeb3 } from "@/providers/web3";
import { useStuffItemsByOwner } from "@/queries/useStuffItemsByOwner";

const useAccount = () => {
	const { eoa } = useWeb3();

	const { stuffItemsByOwner } = useStuffItemsByOwner({ owner: eoa.address });

	return { stuffItemsByOwner };
};

export { useAccount };

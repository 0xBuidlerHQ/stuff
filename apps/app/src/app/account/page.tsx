import { env } from "@/config/env";
import { AccountPage } from "@/features/account/account-page";
import { getStuffs } from "@/features/stuff/getStuffs";

const Page = async () => {
	const stuffs = await getStuffs({ chainId: env.CHAIN_ID as any });

	return <AccountPage stuffs={stuffs} />;
};

export default Page;

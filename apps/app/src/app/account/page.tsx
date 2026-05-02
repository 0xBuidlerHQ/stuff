import { AccountPage, type AccountProject } from "@/features/account/account-page";
import { getFactoryProjects } from "@/features/product-catalog";

const Page = async () => {
	const projects = await getFactoryProjects();

	const accountProjects: AccountProject[] = projects.map((project) => ({
		slug: project.slug,
		stuffAddress: project.stuffAddress,
		collection: project.collection,
	}));

	return <AccountPage projects={accountProjects} />;
};

export default Page;

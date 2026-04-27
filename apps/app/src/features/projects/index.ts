import { stuffErc721Config } from "@0xhq/stuff.contracts";

const projects = {
	"000": {
		name: "Genesis",

		product: {
			type: "T-Shirt",
			web3: {
				config: stuffErc721Config,
			},
		},
	},
} as const;

type ProjectSlug = keyof typeof projects;

type ProjectSlugs = (typeof projects)[keyof typeof projects];

const projectSlugs = Object.keys(projects) as ProjectSlug[];

const getProject = (slug: string) => {
	return projects[slug as ProjectSlug];
};

export type { ProjectSlug, ProjectSlugs };
export { getProject, projectSlugs, projects };

const links = {
	home: {
		name: "home",
		url: "/",
	},
	projects: {
		name: "projects",
		url: "/projects",

		items: [
			{
				name: "000",
				url: "/000",
			},
		],
	},
	about: {
		name: "about",
		url: "/about",
	},
} as const;

type LinkFrom<T> = T extends { readonly items: readonly (infer Item)[] }
	? T | LinkFrom<Item>
	: T;

type Link = LinkFrom<(typeof links)[keyof typeof links]>;

const normalizePath = (path: string) =>
	path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;

export function isPathInLink(path: string, link: Link): boolean {
	const normalizedPath = normalizePath(path);
	const linkUrl = link.url === "/" ? "/" : link.url;

	const isInCurrentLink =
		linkUrl === "/"
			? normalizedPath === "/"
			: normalizedPath !== "/" && normalizedPath.startsWith(linkUrl);

	if (isInCurrentLink) {
		return true;
	}

	return "items" in link && link.items.some((item) => isPathInLink(path, item));
}

export function isPathInLinks(path: string) {
	return Object.values(links).some((link: Link) => isPathInLink(path, link));
}

const externalLinks = {
	telegram: "https://t.me/the0xbuidler",
	github: "https://github.com/0xbuidler",
	x: "https://x.com/maximeisalive",
};

export { externalLinks, links };

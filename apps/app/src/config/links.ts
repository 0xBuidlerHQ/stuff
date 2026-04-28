const links = {
	home: {
		name: "home",
		url: "/",
	},
	products: {
		name: "products",
		url: "/products",
	},
	about: {
		name: "about",
		url: "/about",
	},
} as const;

const externalLinks = {
	telegram: "https://t.me/the0xbuidler",
	github: "https://github.com/0xbuidler",
	x: "https://x.com/maximeisalive",
};

export { externalLinks, links };

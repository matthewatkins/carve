const siteFilesURL = "https://files.atkins.codes";

export const config = {
	siteName: "Carve",
	siteDescription:
		"Carve is a modern TypeScript stack for building web applications.",
	siteDescriptionLong:
		"A modern TypeScript stack with microservices architecture, combining Nuxt, Elysia, ORPC, Better Auth, and more.",
	siteUrl: "https://carve.atkins.codes",
	siteAuthor: "Matthew Atkins",
	siteAuthorEmail: "matthew@atkins.codes",
	siteAuthorTwitter: "https://x.com/matthewatkins",
	siteAuthorGitHub: "https://github.com/matthewatkins",
	siteAuthorLinkedIn: "https://www.linkedin.com/in/atkinsmatthew",
	siteOgImage: `${siteFilesURL}/og-image-default.png`,
	siteTwitterCardImage: `${siteFilesURL}/twitter-card-default.png`,
};

export type SiteConfig = typeof config;

export const SITE_CONFIG: SiteConfig = config;

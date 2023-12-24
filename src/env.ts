import 'dotenv/config';
const env = {
	// ! [REQUIRED] the discord bot's token
	TOKEN: process.env['TOKEN']!,
	// ! [REQUIRED] OAuth2 credentials
	OAUTH2_URL: process.env['OAUTH2_URL']!,
	// ! [REQUIRED] the bot Invite link
	INVITE_LINK: process.env['INVITE_LINK']!,
	// ? [Recommended] a webhook for logs
	LOG_WEBHOOK: process.env['LOG_WEBHOOK'],
	// ? [Recommended] a comma separated list of discord user IDs that can access the admin dashboard, leave empty for no auth
	OWNER_IDS: process.env['OWNER_IDS'] ? process.env['OWNER_IDS'].split(',') : [],
	// * npm package version
	VERSION: process.env['npm_package_version']!,
	// * the server's port (default: 8080)
	PORT: Number(process.env['PORT']) || 8080,
	// * the current environment (default: development)
	NODE_ENV: process.env['NODE_ENV'] || 'development',
} as const;
export default env;

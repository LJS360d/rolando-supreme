import { DiscordUserInfo } from 'fonzi2/dist/types/discord.user.info';

export type RenderOptions = Readonly<{
	themes: string[];
	theme: string;
	title: string;
	version: string;
	routes: Route[];
	userInfo?: DiscordUserInfo;
}>;

export interface Props {
	[x: string]: any;
}

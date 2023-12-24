import { ApplicationCommandData } from 'discord.js';
import { ClientEvent, Handler, HandlerType, Logger } from 'fonzi2';
import env from '../env';
import { StarterKitServer } from '../server/server';

export default class ClientEventsHandler extends Handler {
	public readonly type = HandlerType.clientEvent;

	constructor(private commands: ApplicationCommandData[]) {
		super();
	}

	@ClientEvent('ready')
	async onReady() {
		// * Successful login
		Logger.info(`Logged in as ${this.client?.user?.tag}!`);

		const loading = Logger.loading('Started refreshing application (/) commands.');
		try {
			await this.client?.application?.commands.set(this.commands);
			loading.success('Successfully reloaded application (/) commands.');
			new StarterKitServer(this.client!, {
				port: env.PORT,
				inviteLink: env.INVITE_LINK,
				oauth2url: env.OAUTH2_URL,
				ownerIds: env.OWNER_IDS,
				version: env.VERSION,
			}).start();
		} catch (err: any) {
			loading.fail('Failed to reload application (/) commands.');
			Logger.error(err);
			process.exit(1);
		}
	}
}

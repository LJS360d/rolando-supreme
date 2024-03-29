import { ApplicationCommandData, Guild } from 'discord.js';
import { ClientEvent, Handler, HandlerType, Logger } from 'fonzi2';
import { GuildsService } from '../domain/services/guilds.service';
import { env } from '../env';
import { RolandoServer } from '../server/rolando.server';
import { GUILD_CREATE_MSG } from '../static/text';
import { ChainsService } from '../domain/services/chains.service';

export class EventsHandler extends Handler {
	public readonly type = HandlerType.clientEvent;

	constructor(
		private commands: ApplicationCommandData[],
		private guildsService: GuildsService,
		private chainsService: ChainsService
	) {
		super();
	}

	@ClientEvent('ready')
	async onReady() {
		Logger.info(`Logged in as ${this.client?.user?.tag}!`);

		const load = Logger.loading('Started refreshing application (/) commands.');
		try {
			await this.client?.application?.commands.set(this.commands);
			load.success('Reloaded application (/) commands.');
			new RolandoServer(
				this.client,
				{
					port: env.PORT,
					inviteLink: env.INVITE_LINK,
					oauth2url: env.OAUTH2_URL,
					ownerIds: env.OWNER_IDS,
					version: env.VERSION,
				},
				this.chainsService
			).start();
		} catch (err: any) {
			load.fail('Failed to refresh application (/) commands.');
			Logger.error(err);
		}
	}

	@ClientEvent('guildCreate')
	async onGuildCreate(guild: Guild) {
		Logger.info(`Joined guild ${guild.name}`);
		void guild.systemChannel?.send(GUILD_CREATE_MSG(guild.name));
		void this.guildsService.create(guild);
	}

	@ClientEvent('guildDelete')
	async onGuildDelete(guild: Guild) {
		Logger.info(`Left guild ${guild.name}`);
	}
}

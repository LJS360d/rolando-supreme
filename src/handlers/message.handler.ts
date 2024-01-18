import { Message } from 'discord.js';
import { MarkovChain } from '../domain/model/markov.chain';
import { ChainsService } from '../domain/services/chains.service';
import { getRandom } from '../utils/random.utils';
import { Handler, HandlerType, MessageEvent } from 'fonzi2';
import { GuildsService } from '../domain/services/guilds.service';

export class MessageHandler extends Handler {
	public readonly type = HandlerType.messageEvent;
	constructor(
		private chainService: ChainsService,
		private guildsService: GuildsService
	) {
		super();
	}

	@MessageEvent('GuildText')
	async onGuildMessage(message: Message<true>) {
		const { author, guild, content } = message;

		if (author.id === this.client?.user?.id) return;
		const lang = await this.guildsService.getGuildLanguage(guild.id);
		if (content.length > 3) {
			// * Learning from message
			this.chainService.updateChain(lang, content);
		}

		const chain = (await this.chainService.getChainForGuild(guild.id))!;

		const guildDoc = await this.guildsService.getOne(message.guild);
		const mention = message.mentions.users.some((value) => value === this.client?.user);

		if (mention) {
			await message.channel.sendTyping();
			void message.reply(await this.getMessage(chain));
			return;
		}
		const randomMessage =
			guildDoc.replyRate === 1 ||
			(guildDoc.replyRate > 1 && getRandom(1, guildDoc.replyRate) === 1);
		if (randomMessage) {
			await message.channel.sendTyping();
			void message.channel.send(await this.getMessage(chain));
			return;
		}
	}

	private async getMessage(chain: MarkovChain) {
		const random = getRandom(4, 25);
		// Adjusted probabilities
		const reply =
			random <= 21
				? // ? 84% chance for text
					chain.talk(random)
				: random <= 23
					? // ? 10% chance for gif
						await chain.mediaStorage.getMedia('gif')
					: random <= 24
						? // ? 5% chance for image
							await chain.mediaStorage.getMedia('image')
						: // ? 1% chance for video
							await chain.mediaStorage.getMedia('video');
		return reply;
	}
}

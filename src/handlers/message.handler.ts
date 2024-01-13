import { Message } from 'discord.js';
import { MarkovChain } from '../domain/model/markov.chain';
import { ChainService } from '../domain/services/chain.service';
import { getRandom } from '../utils/random.utils';
import { Handler, HandlerType, MessageEvent } from 'fonzi2';
import { GuildsService } from '../domain/services/guilds.service';

export class MessageHandler extends Handler {
	public readonly type = HandlerType.messageEvent;
	private chain: MarkovChain;
	constructor(
		private chainService: ChainService,
		private guildsService: GuildsService
	) {
		super();
		this.chain = this.chainService.chain;
	}

	@MessageEvent('GuildText')
	async onGuildMessage(message: Message<true>) {
		const { author, guild, content } = message;
		if (author.id === this.client?.user?.id) return;

		if (content.length > 3) {
			// * Learning from message
			this.chainService.updateChain(content, guild.id);
		}

		const guildDoc =
			(await this.guildsService.getOne(message.guildId)) ??
			(await this.guildsService.create(message.guild));

		const mention = content.includes(`<@${this.client?.user?.id}>`);
		if (mention) {
			await message.channel.sendTyping();
			void message.reply(await this.getMessage(this.chain));
			return;
		}
		const randomMessage =
			guildDoc.replyRate === 1 ||
			(guildDoc.replyRate > 1 && getRandom(1, guildDoc.replyRate) === 1);
		if (randomMessage) {
			await message.channel.sendTyping();
			void message.channel.send(await this.getMessage(this.chain));
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

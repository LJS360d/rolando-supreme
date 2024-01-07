import { Message } from 'discord.js';
import { Handler, HandlerType, Logger, MessageEvent } from 'fonzi2';

export class MessageHandler extends Handler {
	public readonly type = HandlerType.messageEvent;

	constructor() {
		super();
	}

	@MessageEvent('GuildText')
	async onMessage(message: Message<true>) {
		Logger.trace(
			`Message in ${message.guild.name} from ${message.author.displayName}: ${message.content}`
		);
	}
}

import { ChatInputCommandInteraction } from 'discord.js';
import { Command, Handler, HandlerType } from 'fonzi2';

export class CommandsHandler extends Handler {
	public readonly type = HandlerType.commandInteraction;

	constructor(private version: string) {
    super();
  }
  
	@Command({ name: 'version', description: 'returns the application version' })
	public async ping(interaction: ChatInputCommandInteraction<'cached'>) {
		await interaction.reply(this.version);
	}
}

import { ButtonInteraction } from 'discord.js';
import { Button, Handler, HandlerType } from 'fonzi2';
import { DataFetchService } from '../domain/services/data.fetch.service';
import { GuildsService } from '../domain/services/guilds.service';
import { FETCH_COMPLETE_MSG, FETCH_CONFIRM_MSG } from '../static/text';

export class ButtonsHandler extends Handler {
	public readonly type = HandlerType.buttonInteraction;
	private dataFetchService: DataFetchService;

	constructor(private guildsService: GuildsService) {
		super();
		this.dataFetchService = new DataFetchService(this.client!, this.guildsService);
	}

	@Button('confirm-train')
	async onConfirmTrain(interaction: ButtonInteraction<'cached'>) {
		void interaction.deferUpdate();
		await interaction.channel?.send({
			content: FETCH_CONFIRM_MSG(interaction.user.id),
		});
		const startTime = Date.now();
		const messages = await this.dataFetchService.fetchAllGuildMessages(interaction.guild);
		await interaction.channel?.send({
			content: FETCH_COMPLETE_MSG(
				interaction.user.id,
				messages.length,
				Date.now() - startTime
			),
		});
	}

	@Button('cancel-train')
	async onCancelTrain(interaction: ButtonInteraction<'cached'>) {
		void interaction.reply({
			content: 'The fetching process was canceled.',
			ephemeral: true,
		});
	}
}

import { ButtonInteraction } from 'discord.js';
import { Button, Handler, HandlerType } from 'fonzi2';
import { ChainsService } from '../domain/services/chains.service';
import { DataFetchService } from '../domain/services/data.fetch.service';
import { FETCH_COMPLETE_MSG, FETCH_CONFIRM_MSG, FETCH_DENY_MSG } from '../static/text';
import { GuildsService } from '../domain/services/guilds.service';

export class ButtonsHandler extends Handler {
	public readonly type = HandlerType.buttonInteraction;

	constructor(
		private chainService: ChainsService,
		private guildsService: GuildsService
	) {
		super();
	}

	@Button('confirm-train')
	async onConfirmTrain(interaction: ButtonInteraction<'cached'>) {
		void interaction.deferUpdate();
		const guildDoc = await this.guildsService.getOne(interaction.guild);
		if (guildDoc.contributed) {
			await interaction.channel?.send({
				content: FETCH_DENY_MSG(interaction.guild.name),
			});
			return;
		}
		await interaction.channel?.send({
			content: FETCH_CONFIRM_MSG(interaction.user.id),
		});
		void this.guildsService.update(interaction.guild, undefined, true);
		const startTime = Date.now();
		const messages = await new DataFetchService(
			this.client!,
			this.chainService
		).fetchAllGuildMessages(interaction.guild);
		await interaction.channel?.send({
			content: FETCH_COMPLETE_MSG(
				interaction.user.id,
				messages.length,
				Date.now() - startTime
			),
		});
		// ? training performed in the dataFetchService
		// this.chainService.updateChain(interaction.guildId, messages);
	}

	@Button('cancel-train')
	async onCancelTrain(interaction: ButtonInteraction<'cached'>) {
		void interaction.reply({
			content: 'The fetching process was canceled.',
			ephemeral: true,
		});
	}
}

import {
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	PermissionsBitField,
} from 'discord.js';

import { ActionRow, Buttons, Command, Handler, HandlerType } from 'fonzi2';
import { ChainsService } from '../domain/services/chains.service';
import { GuildsService } from '../domain/services/guilds.service';
import { LanguageChoices } from '../static/languages';
import { env } from '../env';
import { TRAIN_REPLY } from '../static/text';
import { getRandom } from '../utils/random.utils';

export class CommandsHandler extends Handler {
	public readonly type = HandlerType.commandInteraction;
	constructor(
		private chainService: ChainsService,
		private guildsService: GuildsService
	) {
		super();
	}

	@Command({
		name: 'contribute',
		description:
			'Fetches all available messages in the server to be used as training data',
	})
	public async contribute(interaction: ChatInputCommandInteraction) {
		if (!(await this.checkAdmin(interaction))) return;
		const confirm = Buttons.confirm('confirm-train');
		const cancel = Buttons.cancel('cancel-train');

		void interaction.reply({
			content: TRAIN_REPLY,
			components: [ActionRow.actionRowData(cancel, confirm)],
			ephemeral: true,
		});
	}

	@Command({ name: 'gif', description: 'Returns a gif from the ones it knows' })
	public async gif(interaction: ChatInputCommandInteraction<'cached'>) {
		const guildId = interaction.guildId;
		const chain = await this.chainService.getChainForGuild(guildId);
		void interaction.reply({ content: await chain.mediaStorage.getMedia('gif') });
	}

	@Command({ name: 'image', description: 'Returns a image from the ones it knows' })
	public async image(interaction: ChatInputCommandInteraction<'cached'>) {
		const guildId = interaction.guildId;
		const chain = await this.chainService.getChainForGuild(guildId);
		void interaction.reply({ content: await chain.mediaStorage.getMedia('image') });
	}

	@Command({ name: 'video', description: 'Returns a video from the ones it knows' })
	public async video(interaction: ChatInputCommandInteraction<'cached'>) {
		const guildId = interaction.guildId;
		const chain = await this.chainService.getChainForGuild(guildId);
		void interaction.reply({ content: await chain.mediaStorage.getMedia('video') });
	}

	@Command({
		name: 'replyrate',
		description: 'check or set the reply rate',
		options: [
			{
				name: 'rate',
				description: 'the rate to set',
				type: ApplicationCommandOptionType.Integer,
				required: false,
			},
		],
	})
	public async replyrate(interaction: ChatInputCommandInteraction<'cached'>) {
		const rate = interaction.options.getInteger('rate');
		const guildDoc = (await this.guildsService.getOne(interaction.guild))!;
		if (rate !== null) {
			const msg = 'You are not authorized to change the reply rate.';
			if (!(await this.checkAdmin(interaction, msg))) return;
			await this.guildsService.update(interaction.guildId, { replyRate: rate });
			void interaction.reply({ content: `Set reply rate to \`${rate}\`` });
			return;
		}
		await interaction.reply({ content: `Current rate is \`${guildDoc.replyRate}\`` });
	}

	@Command({
		name: 'language',
		description: "check or set the server's language",
		options: [
			{
				name: 'language',
				description: 'the language to set',
				type: ApplicationCommandOptionType.String,
				required: false,
				choices: LanguageChoices,
			},
		],
	})
	public async language(interaction: ChatInputCommandInteraction<'cached'>) {
		const lang = interaction.options.getString('language');
		const guildDoc = (await this.guildsService.getOne(interaction.guild))!;
		if (lang !== null) {
			const msg = 'You are not authorized to change the language.';
			if (!(await this.checkAdmin(interaction, msg))) return;
			await this.guildsService.update(interaction.guildId, {
				language: lang,
				name: guildDoc.name,
			});
			void interaction.reply({ content: `Set server language to \`${lang}\`` });
			return;
		}
		await interaction.reply({ content: `Current language is \`${guildDoc.language}\`` });
	}

	@Command({
		name: 'opinion',
		description: 'Get a reply with a specific word as the seed',
		options: [
			{
				name: 'about',
				description: 'The seed of the message',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
		],
	})
	public async opinion(interaction: ChatInputCommandInteraction<'cached'>) {
		const about = interaction.options.getString('about')!.split(' ').at(-1)!;
		const guildId = interaction.guildId;
		const chain = await this.chainService.getChainForGuild(guildId);
		const msg = chain.generateText(about, getRandom(8, 40));
		void interaction.reply({ content: msg });
		return;
	}

	private async checkAdmin(interaction: ChatInputCommandInteraction, msg?: string) {
		if (env.OWNER_IDS.includes(interaction.user.id)) {
			return true;
		}
		const perms = interaction.member?.permissions as Readonly<PermissionsBitField>;
		if (perms.has('Administrator')) {
			return true;
		}
		await interaction.reply({
			content: msg || 'You are not authorized to use this command.',
			ephemeral: true,
		});
		return false;
	}
}

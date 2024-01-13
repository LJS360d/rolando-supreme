import {
	ChatInputCommandInteraction,
	PermissionsBitField,
	EmbedBuilder,
	ApplicationCommandOptionType,
} from 'discord.js';

import { env } from '../env';
import { ChainService } from '../domain/services/chain.service';
import { TRAIN_REPLY } from '../static/text';
import { getRandom } from '../utils/random.utils';
import { ActionRow, Buttons, Command, Handler, HandlerType } from 'fonzi2';
import { MarkovChain } from '../domain/model/markov.chain';
import { GuildsService } from '../domain/services/guilds.service';

export class CommandsHandler extends Handler {
	public readonly type = HandlerType.commandInteraction;
	private chain: MarkovChain;
	constructor(
		private chainService: ChainService,
		private guildsService: GuildsService
	) {
		super();
		this.chain = this.chainService.chain;
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
		void interaction.reply({ content: await this.chain.mediaStorage.getMedia('gif') });
	}

	@Command({ name: 'image', description: 'Returns a image from the ones it knows' })
	public async image(interaction: ChatInputCommandInteraction<'cached'>) {
		void interaction.reply({ content: await this.chain.mediaStorage.getMedia('image') });
	}

	@Command({ name: 'video', description: 'Returns a video from the ones it knows' })
	public async video(interaction: ChatInputCommandInteraction<'cached'>) {
		void interaction.reply({ content: await this.chain.mediaStorage.getMedia('video') });
	}

	@Command({ name: 'analytics', description: 'Returns the analytics of the bot' })
	public async analytics(interaction: ChatInputCommandInteraction<'cached'>) {
		const analytics = this.chain.analytics;
		const embed = new EmbedBuilder()
			.setTitle('Analytics')
			.setDescription(
				'Complexity Score indicates how _smart_ the bot is.\n Higher value means smarter'
			)
			.setColor('Gold')
			.addFields(
				{
					name: 'Complexity Score',
					value: `\`${analytics.complexityScore}\``,
					inline: true,
				},
				{
					name: 'Vocabulary',
					value: `\`${analytics.words} words\` `,
					inline: true,
				},
				{ name: '\t', value: '\t' },
				{ name: 'Gifs', value: `\`${analytics.gifs}\``, inline: true },
				{ name: 'Videos', value: `\`${analytics.videos}\``, inline: true },
				{ name: 'Images', value: `\`${analytics.images}\``, inline: true }
			);
		void interaction.reply({
			embeds: [embed],
		});
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
		const guildDoc = (await this.guildsService.getOne(interaction.guild.id))!;
		if (rate !== null) {
			const msg = 'You are not authorized to change the reply rate.';
			if (!(await this.checkAdmin(interaction, msg))) return;
			await this.guildsService.update(interaction.guild, rate);
			void interaction.reply({ content: `Set reply rate to \`${rate}\`` });
			return;
		}
		await interaction.reply({ content: `Current rate is \`${guildDoc.replyRate}\`` });
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
		const msg = this.chain.generateText(about, getRandom(8, 40));
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

import { type ChatInputCommandInteraction } from 'discord.js';

import { FileManager } from '../FileManager';
import { InteractionManager } from '../InteractionManager';
import { type MarkovChain } from '../MarkovChain';
import { REPLYRATE_COMMAND_LABEL } from '../static/Static';

type CommandInteraction = {
  name: string;
  fn: (interaction: ChatInputCommandInteraction, chain?: MarkovChain) => void;
};

export const commandInteractions: CommandInteraction[] = [
  {
    name: 'irlfact',
    fn: async (interaction) => InteractionManager.irlFact(interaction),
  },
  {
    name: 'catfact',
    fn: async (interaction) => InteractionManager.catFact(interaction),
  },
  {
    name: 'ping',
    async fn(interaction) {
      if (await InteractionManager.checkAdmin(interaction)) {
        InteractionManager.ping(interaction);
      }
    },
  },
  {
    name: 'providetraining',
    async fn(interaction) {
      if (await InteractionManager.checkAdmin(interaction)) {
        InteractionManager.provideTraining(interaction);
      }
    },
  },
  {
    name: 'resettraining',
    async fn(interaction) {
      if (await InteractionManager.checkAdmin(interaction)) {
        InteractionManager.resetTraining(interaction);
      }
    },
  },
  {
    name: 'wipe',
    fn(interaction) {
      InteractionManager.delete(interaction, interaction.options.getString('data'));
    },
  },
  {
    name: 'setreplyrate',
    async fn(interaction, chain) {
      chain.replyRate = interaction.options.getInteger('rate');
      const reply =
        chain.replyRate === 0
          ? "Ok, I won't reply to anybody"
          : chain.replyRate === 1
            ? 'Ok, I will always reply'
            : `Set reply rate to ${chain.replyRate}`;
      FileManager.saveReplyRate(chain.replyRate, interaction.guild.id);
      await interaction.reply({ content: reply });
    },
  },
  {
    name: 'replyrate',
    async fn(interaction, chain) {
      await interaction.reply(REPLYRATE_COMMAND_LABEL(chain.replyRate.toString()));
    },
  },
  {
    name: 'analytics',
    fn: async (interaction) => InteractionManager.getAnalytics(interaction),
  },
  {
    name: 'help',
    fn: async (interaction) => InteractionManager.help(interaction),
  },
  {
    name: 'opinion',
    fn: async (interaction, chain) => InteractionManager.getOpinion(interaction, chain),
  },
  { name: 'gif', fn: async (_, chain) => chain.getGif() },
  { name: 'image', fn: async (_, chain) => chain.getImage() },
  { name: 'video', fn: async (_, chain) => chain.getVideo() },
  {
    name: 'hyero',
    fn: async (interaction, chain) => InteractionManager.hyero(interaction, chain),
  },
  {
    name: 'unhyero',
    fn: async (interaction) => InteractionManager.unhyero(interaction),
  },
];

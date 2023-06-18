import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
} from 'discord.js';

import { dataRetriever } from './main';
import { chainsMap } from './MarkovChain';

export class InteractionManager {
    constructor() {}

    static async provideTraining(interaction: ChatInputCommandInteraction) {
        // Confirm Button
        const confirm = new ButtonBuilder()
            .setCustomId('confirm-provide-training')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success);
        // Cancel Button
        const cancel = new ButtonBuilder()
            .setCustomId('cancel-provide-training')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(confirm, cancel);

        await interaction.reply({
            content: `Are you sure you want to provide **ALL THE MESSAGES IN THE SERVER** as training data for me?\nThis will make me fetch all the channels i can access.\nIf you don't want me to learn from a some channels, remove my permisions to type in them.`,
            components: [row as any],
            ephemeral: true,

        });
    }

    static async confirmProvideTraining(interaction: ButtonInteraction) {
        if (!dataRetriever.fileManager.guildHasPreviousData(interaction.guild.id)) {
            await interaction.reply({
                content: `<@${interaction.user.id}> Started Fetching messages.\nI will send a message when I'm done\nEstimated Time: \`1 Minute per every 4000 Messages in the Server\`\nThis might take a while...`,
                ephemeral: true
            });

            const start = Date.now();
            await dataRetriever.fetchAndStoreAllMessagesInGuild(interaction.guild).then(() => {
                const runtime = new Date(Date.now() - start);
                const formattedTime = `${runtime.getMinutes()}m ${runtime.getSeconds()}s`;
                interaction.channel.send(`<@${interaction.user.id}> Finished Fetching training data!\nTime Passed:\`${formattedTime}\``);
                chainsMap.get(interaction.guild.id).provideData(dataRetriever.fileManager.getPreviousTrainingDataForGuild(interaction.guild.id));
            });
        } else {
            await interaction.reply({
                content: `I already have training data for this server`,
                ephemeral: true
            });
        }

        //rest
    }

    static async cancelProvideTraining(interaction: ButtonInteraction) {
        await interaction.reply({
            content: `The process was canceled`,
            ephemeral: true
        });
    }

    static async resetTraining(interaction: ChatInputCommandInteraction) {
        // Confirm Button
        const confirm = new ButtonBuilder()
            .setCustomId('confirm-reset-training')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Danger);
        // Cancel Button
        const cancel = new ButtonBuilder()
            .setCustomId('cancel-reset-training')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(confirm, cancel);

        await interaction.reply({
            content: `This command will delete **ALL PREVIOUS TRAINING DATA**?\nThis will make me unmemorize all the messages i learned from.\n**Are you sure?**`,
            components: [row as any],
            ephemeral: true,

        });
    }

    static async confirmResetTraining(interaction: ButtonInteraction) {
        await interaction.reply({
            content: `All the training data for this server has been deleted, i am now a blank slate.`,
            ephemeral: true
        });

    }

    static async cancelResetTraining(interaction: ButtonInteraction) {
        await interaction.reply({
            content: `The process was canceled`,
            ephemeral: true
        });
    }

    static async irlFact(interaction: ChatInputCommandInteraction) {
        (await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random', {
            headers: { 'Accept': 'application/json' }
        })).json().then(async res => {
            await interaction.reply({ content: res.text });
        }).catch(error => {
            console.error(error);
        });
    }

    static async catFact(interaction: ChatInputCommandInteraction) {
        (await fetch('https://meowfacts.herokuapp.com/', {
            headers: { 'Accept': 'application/json' }
        })).json().then(async res => {
            await interaction.reply(res.data[0]);
        }).catch(error => {
            console.error(error);
        });
    }
}
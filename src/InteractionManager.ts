import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionsBitField,
} from 'discord.js';

import { FileManager } from './FileManager';
import { dataRetriever } from './main';
import { chainsMap } from './MarkovChain';

export const JOIN_LABEL =
    `Hello, i'm Rolando.\n
I learn to type from the messages you send in chat\n
Run \`/providetraining\` to make me learn from all previous messages.\n
The more messages there are in the server, the more it will make me _intelligent_.`
export class InteractionManager {
    static async getTrainingData(interaction: ChatInputCommandInteraction | ButtonInteraction) {
        await interaction.reply({
            content: `<@${interaction.user.id}> Started Fetching messages.\nI will send a message when I'm done\nEstimated Time: \`1 Minute per every 4000 Messages in the Server\`\nThis might take a while...`,
            ephemeral: true
        });

        const start = Date.now();
        await dataRetriever.fetchAndStoreAllMessagesInGuild(interaction.guild).then(() => {
            const runtime = new Date(Date.now() - start);
            const formattedTime = `${runtime.getMinutes()}m ${runtime.getSeconds()}s`;
            interaction.channel.send(`<@${interaction.user.id}> Finished Fetching training data!\nTime Passed: \`${formattedTime}\``);
            chainsMap.get(interaction.guild.id).provideData(FileManager.getPreviousTrainingDataForGuild(interaction.guild.id));
        });
    }

    static async getAnalytics(interaction: ChatInputCommandInteraction) {
        const chain = chainsMap.get(interaction.guild.id);
        const analytics = chain.getAnalytics();
        const embed = new EmbedBuilder()
            .setTitle('Analytics')
            .setDescription('Complexity Score indicates how _smart_ the bot is.\n Higher value means smarter')
            .setColor('Gold')
            .addFields(
                { name: 'Complexity Score', value: `\`${analytics.complexityScore}\``, inline: true },
                { name: 'Vocabulary', value: `\`${analytics.words} words\` `, inline: true },
                { name: '\t', value: '\t' },
                { name: 'Gifs', value: `\`${analytics.gifs}\``, inline: true },
                { name: 'Videos', value: `\`${analytics.videos}\``, inline: true },
                { name: 'Images', value: `\`${analytics.images}\``, inline: true },
            )
        await interaction.reply({
            embeds: [embed]
        })
    }

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
            content: `Are you sure you want to provide **ALL THE MESSAGES IN THE SERVER** as training data for me?\nThis will make me fetch all the channels i can access.\nIf you don't want me to learn from some channels, remove my permisions to type in them.`,
            components: [row as any],
            ephemeral: true,

        });
    }

    static async confirmProvideTraining(interaction: ButtonInteraction) {
        if (FileManager.guildHasPreviousData(interaction.guild.id)) {
            const confirm = new ButtonBuilder()
                .setCustomId('overwrite-training')
                .setLabel('Overwrite')
                .setStyle(ButtonStyle.Success);
            const cancel = new ButtonBuilder()
                .setCustomId('cancel-provide-training')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder()
                .addComponents(confirm, cancel);

            await interaction.reply({
                content: `Training data for this server has been found\nWould you like to overwrite it?`,
                components: [row as any],
                ephemeral: true,            
            });
            return;
        }
        this.getTrainingData(interaction);
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

    static async delete(interaction: ChatInputCommandInteraction, message: string) {
        const guildId = interaction.guild.id
        const success = chainsMap.get(guildId).delete(message, guildId)
        await interaction.reply({
            content: `${success ? "Deleted data:" : "Data not found:"} \`${message}\``,
            ephemeral: true
        });
    }

    static async checkAdmin(interaction: ChatInputCommandInteraction) {
        if (!(interaction.member.permissions as Readonly<PermissionsBitField>).has('Administrator')) {
            await interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
            return false;
        } return true;
    }

    static async ping(interaction: ChatInputCommandInteraction) {
        try {
            const members = await interaction.guild.members.fetch();

            const userIds = members.map(member => member.user.id);
            const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
            const random = Math.floor(Math.random() * 15) + 1;
            await interaction.reply({
                content: `<@${randomUserId}> ${chainsMap.get(interaction.guild.id).talk(random)}`
            });
        } catch (error) {
            console.error('An error occurred:', error);
        }
    }
}
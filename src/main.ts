import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  Guild,
  Message,
} from 'discord.js';

import { startAdminServer } from './AdminServer';
import { commands } from './Commands';
import { DataRetriever } from './DataRetriever';
import { FileManager } from './FileManager';
import {
  InteractionManager,
  JOIN_LABEL,
} from './InteractionManager';
import {
  chainsMap,
  MarkovChain,
} from './MarkovChain';
import { options } from './Options';

// Import dotenv to load environment variables from .env file
require('dotenv').config();
const TOKEN = process.env['TOKEN'];


export const client = new Client(options);
export const dataRetriever = new DataRetriever()

client.on('ready', () => {
  refreshCommands().then(() => { console.log('Successfully reloaded application (/) commands.') })
  console.log(`Logged in as ${client.user!.tag}!`);
  const guilds = client.guilds.cache
  guilds.forEach((guild: Guild) => {
    chainsMap.set(guild.id, new MarkovChain())
    const previousData = FileManager.getPreviousTrainingDataForGuild(guild.id)
    if (previousData !== null) {
      console.log(`Loading previous data for guild:${guild.name}`);
      //load data into markovchain
      chainsMap.get(guild.id)!.provideData(previousData)
      chainsMap.get(guild.id)!.replyRate = (FileManager.getReplyRate(guild.id) ?? 10)
      console.log(`Loaded ${previousData.length} messages into MarkovChain for guild:${guild.name}`);

    } else
      console.log(`No previous data found for guild:${guild.name}`);
    //dataRetriever.fetchAndStoreAllMessagesInGuild(guild)

  })
  console.log(`Started ${chainsMap.size} Chains`);
  async function refreshCommands(): Promise<void> {
    try {
      console.log('Started refreshing application (/) commands.');
      await client.application?.commands.set(commands);
    } catch (error) { console.error(error) }
  }
})
client.on('guildCreate', (guild: Guild) => {
  chainsMap.set(guild.id, new MarkovChain())
  guild.systemChannel.send(JOIN_LABEL)
})
client.on('guildDelete', (guild: Guild) => {
  chainsMap.delete(guild.id)
  FileManager.deleteGuildData(guild.id)
})
// Command Interactions
client.on('interactionCreate', async function (interaction: ChatInputCommandInteraction) {
  const chain = chainsMap.get(interaction.guildId);
  if (!chain) return;
  if (interaction.isChatInputCommand())

    switch (interaction.commandName) {
      case 'irlfact':
        InteractionManager.irlFact(interaction)
        break;

      case 'catfact':
        InteractionManager.catFact(interaction)
        break;

      case 'ping':
        if(await InteractionManager.checkAdmin(interaction))
        InteractionManager.ping(interaction)
        break;
      case 'providetraining':
        if (await InteractionManager.checkAdmin(interaction))
          InteractionManager.provideTraining(interaction)
        break;

      case "resettraining":
        if (await InteractionManager.checkAdmin(interaction))
          InteractionManager.resetTraining(interaction)
        break;

      case "wipe":
        //if (await InteractionManager.checkAdmin(interaction))
        InteractionManager.delete(interaction, interaction.options.getString('data'))
        break;

      case 'setreplyrate':
        //if (await InteractionManager.checkAdmin(interaction)) {
        chain.replyRate = interaction.options.getInteger('rate');
        const reply = (chain.replyRate === 0) ? `Ok, I won't reply to anybody` :
          (chain.replyRate === 1) ? `Ok, I will always reply` : `Set reply rate to ${chain.replyRate}`
        FileManager.saveReplyRate(chain.replyRate, interaction.guild.id)
        await interaction.reply({ content: reply });
        //}
        break;

      case 'replyrate':
        await interaction.reply(`The reply rate is currently set to ${chain.replyRate}\nUse \`/setreplyrate\` to change it`);
        break;
      case 'analytics':
        await InteractionManager.getAnalytics(interaction);
        break;

      case 'gif':
        await interaction.reply(await chain.getGif());
        break;

      case 'image':
        await interaction.reply(await chain.getImage());
        break;

      case 'video':
        await interaction.reply(await chain.getVideo());
        break;

    }

});
// Button Interactions
client.on('interactionCreate', async function (interaction: ButtonInteraction) {
  if (interaction.isButton())
    switch (interaction.customId) {
      case "overwrite-training":
        InteractionManager.getTrainingData(interaction)
        break;
      case "confirm-provide-training":
        InteractionManager.confirmProvideTraining(interaction)
        break;
      case "cancel-provide-training":
        InteractionManager.cancelProvideTraining(interaction)
        break;
      case "confirm-reset-training":
        InteractionManager.confirmResetTraining(interaction)
        break;
      case "cancel-reset-training":
        InteractionManager.cancelResetTraining(interaction)
        break;

    }
})

client.on('messageCreate', async (msg: Message) => {
  if (msg.author !== client.user) {
    const guildId = msg.guild.id
    const chain = chainsMap.get(guildId)!
    if (msg.content) {
      FileManager.appendMessageToFile(msg.content, guildId)
      chain.updateState(msg.content)
    }

    const pingCondition = (msg.content.includes(`<@${client.user!.id}>`))
    const randomRate: boolean = (chain.replyRate === 1) ? true :
      chain.replyRate === 0 ? false :
        ((Math.floor(Math.random() * chain.replyRate) + 1 === 1));

    if (pingCondition || randomRate) {

      const random = Math.floor(Math.random() * msg.content.split(' ').length + 5) + 1

      const reply = chain.talk(Math.floor(random * 2) + 1)

      if (reply)
        await msg.channel.send(reply)
    }
  }
})

client.login(TOKEN);

startAdminServer()

process.on('SIGINT', async () => {
  console.log('Received SIGINT signal. Shutting down gracefully...');
  /* const logChannel = (client.guilds.cache.get('1119326293255786596').channels.cache.get('1120120129578090586') as GuildTextBasedChannel);
  await logChannel.send('Rolando has been shut down') */
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM signal. Shutting down gracefully...');
  /* const logChannel = (client.guilds.cache.get('1119326293255786596').channels.cache.get('1120120129578090586') as GuildTextBasedChannel);
  await logChannel.send('Rolando has been shut down') */
  process.exit(0)
})
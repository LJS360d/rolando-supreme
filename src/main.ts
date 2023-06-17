import {
  ChatInputCommandInteraction,
  Client,
  GatewayIntentBits,
  Guild,
  Message,
} from 'discord.js';

import { startAdminServer } from './AdminServer';
import { commands } from './Commands';
import { DataRetriever } from './DataRetriever';
import {
  chainsMap,
  MarkovChain,
} from './MarkovChain';

// Import dotenv to load environment variables from .env file
//require('dotenv').config();
const TOKEN = process.env['TOKEN'];
const options = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildScheduledEvents,
    // GatewayIntentBits.GuildInvites,
    // GatewayIntentBits.GuildPresences,
    // GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    // GatewayIntentBits.DirectMessages,
    // GatewayIntentBits.DirectMessageReactions,
    // GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
  ],
}

export const client = new Client(options);
const dataRetriever = new DataRetriever()

client.on('ready', () => {
  refreshCommands().then(() => { console.log('Successfully reloaded application (/) commands.') })
  console.log(`Logged in as ${client.user!.tag}!`);
  const guilds = client.guilds.cache
  guilds.forEach((guild: Guild) => {
    chainsMap.set(guild.id, new MarkovChain())
    const previousData = dataRetriever.fileManager.getPreviousTrainingDataForGuild(guild.id)
    if (previousData !== null) {
      console.log(`Loading previous data for guild:${guild.name}`);
      //load data into markovchain
      chainsMap.get(guild.id)?.provideData(previousData)
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
  guild.systemChannel.send(`Sup, i'm Rolando. \nRun \`/providetraining\` to actually make me do stuff.\nThe more messages there are in the server, the more it will make me intelligent.`)
})
client.on('interactionCreate', async function (interaction: ChatInputCommandInteraction) {
  const chain = chainsMap.get(interaction.guildId);
  switch (interaction.commandName) {
    case 'irlfact':
      (await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random', {
        headers: { 'Accept': 'application/json' }
      })).json().then(async res => {
        await interaction.reply(res.text);
      }).catch(error => {
        console.error(error);
      });
      break;

    case 'catfact':
      (await fetch('https://meowfacts.herokuapp.com/', {
        headers: { 'Accept': 'application/json' }
      })).json().then(async res => {
        await interaction.reply(res.data[0]);
      }).catch(error => {
        console.error(error);
      });
      break;

    case 'providetraining':
      if (!dataRetriever.fileManager.guildHasPreviousData(interaction.guild.id)) {
        interaction.reply(`<@${interaction.user.id}> Started Fetching messages.\nWill send another message when I'm done\nEstimated Time: \`1 Minute per every 4000 Messages in the Server\`\nThis might take a while...`);
        const start = Date.now();
        await dataRetriever.fetchAndStoreAllMessagesInGuild(interaction.guild).then(() => {
          const runtime = new Date(Date.now() - start);
          const formattedTime = `${runtime.getMinutes()}m ${runtime.getSeconds()}s`;
          interaction.channel.send(`<@${interaction.user.id}> Finished Fetching training data!\nTime Passed:\`${formattedTime}\``);
          chainsMap.get(interaction.guild.id).provideData(dataRetriever.fileManager.getPreviousTrainingDataForGuild(interaction.guild.id));
        });
      } else {
        await interaction.reply(`I already have training data for this server`);
      }
      break;

    case 'setreplyrate':
      if (!chain) return;
      chain.replyRate = interaction.options.getInteger('rate');

      if (chain.replyRate > 1) {
        await interaction.reply(`Set reply rate to ${chain.replyRate}`);
      } else if (chain.replyRate === 1) {
        await interaction.reply(`Ok, I will always reply`);
      } else if (chain.replyRate === 0) {
        await interaction.reply(`Ok, I won't reply to anybody`);
      }
      break;

    case 'replyrate':
      if (!chain) return;
      await interaction.reply(`The reply rate is currently set to ${chain.replyRate}\nUse \`/setreplyrate\` to change it`);
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

client.on('messageCreate', async (msg: Message) => {
  const guildId = msg.guild.id
  const chain = chainsMap.get(guildId)!
  const cleanedMsg = msg.content.replace(`<@${client.user!.id}>`, "rolando").toLowerCase();
  dataRetriever.fileManager.appendMessageToFile(cleanedMsg, guildId)
  chain.updateState(cleanedMsg)
  const pingCondition = (msg.content.includes(`<@${client.user!.id}>`))
  const randomRate: boolean = (chain.replyRate === 1) ? true :
    chain.replyRate === 0 ? false :
      ((Math.floor(Math.random() * chain.replyRate) + 1 === 1));

  if ((pingCondition || randomRate) && (msg.author !== client.user)) {

    const words = cleanedMsg.split(' ')

    const random = Math.floor(Math.random() * words.length + 5) + 1
    const randomWord = words.at(random);
    const randomStateWord = chain.getWordsByValue(Math.ceil(random) * random)

    const reply = chain.generateText(randomStateWord[0] ?? randomWord, Math.ceil(random * 2) + 1)

    if (reply)
      await msg.channel.send(reply)
  }
})

client.login(TOKEN);
startAdminServer()

process.on('SIGINT', async () => {
  console.log('Received SIGINT signal. Shutting down gracefully...');
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM signal. Shutting down gracefully...');
  process.exit(0)
})
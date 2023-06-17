import {
  ChatInputCommandInteraction,
  Client,
  GatewayIntentBits,
  Guild,
  Message,
} from 'discord.js';

import { startAdminServer } from './AdminServer';
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

const commands = [
  {
    name: 'irlfact',
    description: 'Replies with a random Real Life fact',
  },
  {
    name: 'catfact',
    description: 'Replies with a random cat fact'
  },
  {
    name: 'gif',
    description: 'Replies with a gif from the ones it has learned COULD BE NSFW!'
  },
  {
    name: 'image',
    description: 'Replies with an image from the ones it has learned COULD BE NSFW!'
  },
  {
    name: 'video',
    description: 'Replies with an video/youtube link from the ones it has learned COULD BE NSFW!'
  },
  {
    name: 'providetraining',
    description: 'Memorizes all the messages of the SERVER and uses them as training data',
  },
  {
    name: 'replyrate',
    description: 'Shows the current reply rate',
  },
  {
    name: 'setreplyrate',
    description: 'Sets the rate at which the bot will reply',
    options: [
      {
        name: 'rate',
        description: "Probability of 1/rate | 1=always reply | 0=never reply unless pinged",
        type: 4, //Integer type
        required: true,
      }
    ]
  }
];
async function refreshCommands(): Promise<void> {
  try {
    console.log('Started refreshing application (/) commands.');
    await client.application?.commands.set(commands);
  } catch (error) { console.error(error) }
}

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

});

client.on('guildCreate', (guild: Guild) => {
  chainsMap.set(guild.id, new MarkovChain())
  console.log(`Joined a new guild: ${guild.name} (ID: ${guild.id})`);
  console.log('Guild member count:', guild.memberCount);
  console.log('Guild owner:', guild.members.cache.get(guild.ownerId));

});
client.on('interactionCreate', async function (interaction: ChatInputCommandInteraction) {
  if (interaction.commandName === 'irlfact') {
    (await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random', {
      headers: { 'Accept': 'application/json' }
    })).json().then(async res => {

      await interaction.reply(res.text);

    }).catch(error => {
      console.error(error)
    })
  }

  if (interaction.commandName === 'catfact') {
    (await fetch('https://meowfacts.herokuapp.com/', {
      headers: { 'Accept': 'application/json' }
    })).json().then(async res => {

      await interaction.reply(res.data[0]);

    }).catch(error => {
      console.error(error)
    })
  }

  if (interaction.commandName === 'providetraining') {
    if (!dataRetriever.fileManager.guildHasPreviousData(interaction.guild.id)) {
      interaction.reply(`<@${interaction.user.id}> Started Fetching messages.\nWill send another message when i'm done\nEstimated Time: \`1 Minute per every 4000 Messages in the Server\`\nThis might take a while...`)
      const start = Date.now();
      await dataRetriever.fetchAndStoreAllMessagesInGuild(interaction.guild).then(() => {
        const runtime = new Date(Date.now() - start);
        const formattedTime = `${runtime.getMinutes()}m ${runtime.getSeconds()}s`;
        interaction.channel.send(`<@${interaction.user.id}> Finished Fetching training data!\nTime Passed:\`${formattedTime}\``)
        chainsMap.get(interaction.guild.id)
          .provideData(dataRetriever.fileManager
            .getPreviousTrainingDataForGuild(interaction.guild.id))
      })
    } else {
      await interaction.reply(`I already have training data for this server`)
    }
  }

  if (interaction.commandName === 'setreplyrate') {
    const chain = chainsMap.get(interaction.guildId)
    if (!chain) return
    chain.replyRate = interaction.options.getInteger('rate')

    if (chain.replyRate > 1)
      await interaction.reply(`Set reply rate to ${chain.replyRate}`)
    if (chain.replyRate === 1)
      await interaction.reply(`Ok i will always reply`)
    if (chain.replyRate === 0)
      await interaction.reply(`Ok i won't reply to anybody`)
  }

  if (interaction.commandName === 'replyrate') {
    const chain = chainsMap.get(interaction.guildId)
    if (!chain) return
    await interaction.reply(`The reply rate is currently set to ${chain.replyRate}\nUse \`/setreplyrate\` to change it`) 
  }

  if (interaction.commandName === 'gif') {
    await interaction.reply(await chainsMap.get(interaction.guild.id).getGif())
  }
  if (interaction.commandName === 'image') {
    await interaction.reply(await chainsMap.get(interaction.guild.id).getImage())
  }
  if (interaction.commandName === 'video') {
    await interaction.reply(await chainsMap.get(interaction.guild.id).getVideo())
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
  // Perform any necessary cleanup operations here

  process.exit(0)
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM signal. Shutting down gracefully...');
  // Perform any necessary cleanup operations here
  process.exit(0)
});

/* async function sendShutdownNotif() {
  const axios = require("axios");
  const webhook = process.env['WEBHOOK']
  return new Promise((resolve, reject) => {
    axios.post(webhook, { content: "Rolando Has Shut down", username: "Rolando" })
      .then(() => {
        resolve(0)
      })
      .catch((err: Error) => {
        console.error(err)
        reject(1)
      })
  })
}*/
import {
  Client,
  GatewayIntentBits,
  Guild,
  Message,
} from 'discord.js';

import {
  DATA_FOLDER,
  fetchAllMessages,
  readMessagesFromFile,
} from './FileManager';
import { MarkovChain } from './MarkovChain';

// Import dotenv to load environment variables from .env file
require('dotenv').config();
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

const client = new Client(options);
const markov = new MarkovChain()
if (Object.keys(markov.state).length == 0) {
  markov.provideData(readMessagesFromFile(DATA_FOLDER + '794730472395112491.dt'))
}
let RATE = 10;
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
    name: 'providetraining',
    description: 'memorizes all the chat messages of the channel',
  },
  {
    name: 'setreplyrate',
    description: 'Sets the rate at which the bot will reply',
    options: [
      {
        name: 'rate',
        description: "Probability of 1/rate (if you put 0 it will always reply)",
        type: 4,
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
  console.log(`Currently part of ${guilds.size} guilds`);
  console.log(`Guilds: ${guilds.map(guild => guild.name).join(', ')}`);
  
  
});
client.on('guildCreate', (guild: Guild) => {
  console.log(`Joined a new guild: ${guild.name} (ID: ${guild.id})`);
  console.log('Guild member count:', guild.memberCount);
  console.log('Guild owner:', guild.members.cache.get(guild.ownerId));
  console.log('Guild channels:', guild.channels.cache);
});
client.on('interactionCreate', async function (interaction: any) {
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
    interaction.reply('Fetching messages.\nWill send another message when i\'m done\nEstimated Time: `10 minutes`')
    const start = Date.now();
    fetchAllMessages(interaction.channel, DATA_FOLDER + interaction.channel.id + ".dt").then((messages: string[]) => {
      markov.provideData(messages)
      const runtime = new Date(Date.now() - start);
      const minutes = runtime.getMinutes();
      const seconds = runtime.getSeconds();
      const formattedTime = `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
      interaction.channel.send(`Finished Fetching training data!\nTime Passed:\`${formattedTime}\``)
    }).then(async () => {
      console.log("Finished Saving training data");
    })
  }

  if (interaction.commandName === 'setreplyrate') {
    RATE = interaction.options.getInteger('rate')
    if (RATE > 0)
      await interaction.reply(`Set reply rate to ${RATE}`)
    else
      await interaction.reply(`Chaos Insues.`)

  }

});

client.on('messageCreate', async (msg: Message) => {
  markov.updateState(msg.content)

  const pingCondition = (msg.content.includes(`<@${client.user!.id}>`))
  const randomRate = (Math.floor(Math.random() * RATE) + 1 === 1)
  if ((pingCondition || randomRate) && (msg.author !== client.user)) {

    const cleanedMsg = msg.content.replace(`<@${client.user!.id}>`, client.user.username);
    const words = cleanedMsg.split(' ')
    const random = Math.floor(Math.random() * words.length)
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const reply = markov.generateText(randomWord, Math.ceil(random * 3) + 10)

    if (reply)
      await msg.channel.send(reply)
  }
})
client.login(TOKEN);

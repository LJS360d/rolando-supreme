import { type ClientOptions, GatewayIntentBits as intents } from 'discord.js';

export const options: ClientOptions = {
	intents: [
		// Intents.AutoModerationConfiguration,
		// intents.AutoModerationExecution,
		// intents.DirectMessageReactions,
		// intents.DirectMessages,
		intents.GuildEmojisAndStickers,
		// Intents.GuildIntegrations,
		// intents.GuildInvites,
		intents.GuildMembers,
		intents.GuildMessageReactions,
		intents.GuildMessageTyping,
		intents.GuildMessages,
		// Intents.GuildModeration,
		// intents.GuildPresences,
		// intents.GuildScheduledEvents,
		// intents.GuildVoiceStates,
		// intents.GuildWebhooks,
		intents.Guilds,
		intents.MessageContent,
	],
};

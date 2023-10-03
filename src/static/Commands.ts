import { type ApplicationCommandDataResolvable } from 'discord.js';

export const commands: ApplicationCommandDataResolvable[] = [
	{
		name: 'help',
		description: 'Shows available commands',
	},
	{
		name: 'providetraining',
		description:
			'Memorizes all the messages of the SERVER and uses them as training data',
	},
	{
		name: 'resettraining',
		description:
			'Deletes all memorized messages, will make me learn from new messages only',
	},
	{
		name: 'irlfact',
		description: 'Replies with a random Real Life fact',
	},
	{
		name: 'catfact',
		description: 'Replies with a random cat fact',
	},
	{
		name: 'ping',
		description: 'pings a random user',
	},
	{
		name: 'opinion',
		description: 'Get a reply with a specific word as the seed',
		options: [
			{
				name: 'about',
				description: 'The seed of the message',
				type: 3, // String type
				required: true,
			},
		],
	},
	{
		name: 'gif',
		description: 'Replies with a gif from the ones it has learned',
	},
	{
		name: 'image',
		description: 'Replies with an image from the ones it has learned',
	},
	{
		name: 'video',
		description: 'Replies with a video from the ones it has learned',
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
				description:
					'Probability of 1/rate | 1=always reply | 0=never reply unless pinged',
				type: 4, // Integer type
				required: true,
			},
		],
	},
	{
		name: 'wipe',
		description: 'deletes the given argument `data` from the training data',
		options: [
			{
				name: 'data',
				description: 'The message or link you want to be erased from memory',
				type: 3, // String type
				required: true,
			},
		],
	},
	{
		name: 'hyero',
		description:
			'translates the given `text` to it and replies with the text translate into hieroglyphs',
		options: [
			{
				name: 'text',
				description: 'The string to translate',
				type: 3, // String type
				required: false,
			},
		],
	},
	{
		name: 'analytics',
		description: 'Shows data about the state of the bot',
	},
];

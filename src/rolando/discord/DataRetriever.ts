import {
	type Guild,
	type GuildTextBasedChannel,
	type Message,
	PermissionFlagsBits,
	PermissionsBitField,
	GuildBasedChannel,
} from 'discord.js';

import { FileManager } from '../domain/FileManager';
import { client } from '../../main';
import { MSG_LIMIT } from '../../static/Static';
import { containsWorkingURL } from '../../utils/Utils';

type fetchingStatus = { fetching: boolean; channelNames: string[] };
export class DataRetriever {
	static fetchStatus: fetchingStatus = { fetching: false, channelNames: [] };
	constructor() {}

	async fetchAndStoreAllMessagesInGuild(guild: Guild): Promise<void> {
		return new Promise(async (resolve) => {
			const channelPromises: Array<Promise<void>> = [];
			guild.channels.cache.forEach(async (channel: GuildBasedChannel) => {
				try {
					const perms = channel.permissionsFor(client.user);

					if (this.hasGuildTextChannelPermissions(perms, channel)) {
						// type casting is safe due to conditional checking
						// guild.id becomes the name of the file that stores messages as training data
						const channelPromise = this.fetchAndStoreAllMessagesInChannel(
							channel as GuildTextBasedChannel,
							guild.id
						);
						channelPromises.push(channelPromise);
						DataRetriever.fetchStatus.fetching = true;
						DataRetriever.fetchStatus.channelNames.push(`#${channel.name}`);
					}
				} catch (error) {
					console.log(`Could not access channel: ${channel.name}`);
				}
			});
			await Promise.all(channelPromises);
			DataRetriever.fetchStatus.channelNames = [];
			DataRetriever.fetchStatus.fetching = false;

			resolve();
		});
	}

	async fetchAndStoreAllMessagesInChannel(
		channel: GuildTextBasedChannel,
		fileName: string
	): Promise<void> {
		return new Promise(async (resolve, reject) => {
			try {
				const messages: string[] = [];
				let lastMessageID: string | undefined = null;
				let remaining = true;

				while (remaining && messages.length < MSG_LIMIT) {
					// Fetch a batch of messages
					const messageBatch = await channel.messages.fetch({
						limit: 100,
						before: lastMessageID,
					});

					if (lastMessageID === undefined) {
						// No more messages remaining
						remaining = false;
						continue;
					}

					// Add messages to the array
					messageBatch.forEach((msg: Message) => {
						if (msg.content && !msg.author.bot) {
							// Check if msg has a working URL
							const message: string = containsWorkingURL(msg.content)
								? msg.content
								: msg.content.toLowerCase();
							messages.push(message);
							FileManager.appendMessageToFile(message, fileName);
						}
					});

					// Update the last message ID for the next batch
					lastMessageID = messageBatch.at(-1)?.id;
					console.log(`${channel.name}: Fetched ${messages.length} messages`);
				}

				resolve();
			} catch (error) {
				console.error(`Error fetching messages: ${error}`);
				reject(`Error fetching messages: ${error}`);
			}
		});
	}

	private hasGuildTextChannelPermissions(
		perms: Readonly<PermissionsBitField>,
		channel: GuildBasedChannel
	): boolean {
		const canReadChannel = perms.has(PermissionFlagsBits.ReadMessageHistory);
		const canAccessChannel = perms.has(PermissionFlagsBits.SendMessages);
		const canViewChannel = perms.has(PermissionFlagsBits.ViewChannel);
		return (
			channel.isTextBased() &&
			!channel.isVoiceBased() &&
			canReadChannel &&
			canAccessChannel &&
			canViewChannel
		);
	}
}

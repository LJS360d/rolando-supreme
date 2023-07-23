import {
  BaseChannel,
  Guild,
  GuildTextBasedChannel,
  Message,
  PermissionFlagsBits,
} from 'discord.js';

import { FileManager } from './FileManager';
import { client } from './main';

type fetchingStatus = { fetching: boolean, guildNames: string[] };
export class DataRetriever {

    static fetchStatus: fetchingStatus = { fetching: false, guildNames: [] };
    constructor() { }

    async fetchAndStoreAllMessagesInGuild(guild: Guild): Promise<void> {
        return new Promise(async (resolve) => {
            const channelPromises: Promise<void>[] = [];
            guild.channels.cache.forEach(async (channel: BaseChannel) => {
                try {
                    const permissions = (channel as GuildTextBasedChannel).permissionsFor(client.user);
                    const canReadChannel = permissions.has(PermissionFlagsBits.ReadMessageHistory);
                    const canAccessChannel = permissions.has(PermissionFlagsBits.SendMessages);
                    const canViewChannel = permissions.has(PermissionFlagsBits.ViewChannel);
                    const isValidChannel = channel.isTextBased() && !channel.isVoiceBased() && canReadChannel && canAccessChannel && canViewChannel;

                    if (isValidChannel) {
                        //Gives the channel to be iterated for message fetching
                        //guild.id becomes the name of the file that stores messages as training data
                        const channelPromise = this.fetchAndStoreAllMessagesInChannel(
                            channel as GuildTextBasedChannel,
                            guild.id
                        );
                        channelPromises.push(channelPromise);
                        DataRetriever.fetchStatus.fetching = true;
                        DataRetriever.fetchStatus.guildNames.push(guild.name);

                    }
                } catch (error) {
                    console.error(`Error accessing channel`);
                }
            })
            await Promise.all(channelPromises);
            DataRetriever.fetchStatus.guildNames.splice(DataRetriever.fetchStatus.guildNames.indexOf(guild.name),1)
            DataRetriever.fetchStatus.fetching = !!DataRetriever.fetchStatus.guildNames.length;

            resolve();
        });
    }

    async fetchAndStoreAllMessagesInChannel(channel: GuildTextBasedChannel, fileName: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const MSG_LIMIT = 500000;
                const messages: string[] = [];
                let lastMessageID: string | undefined | null = null;
                let remaining = true;

                while (remaining && messages.length < MSG_LIMIT) {
                    // Fetch a batch of messages
                    const messageBatch = await channel.messages.fetch({ limit: 100, before: lastMessageID });

                    if (lastMessageID === undefined) {
                        // No more messages remaining
                        remaining = false;
                        continue;
                    }

                    // Add messages to the array
                    messageBatch.forEach((msg: Message) => {
                        if (msg.content) {
                            //check if msg has a working URL
                            const message: string = (containsWorkingURL(msg.content)) ? msg.content : msg.content.toLowerCase();
                            messages.push(message);
                            FileManager.appendMessageToFile(message, fileName)
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
}

export function containsWorkingURL(string: string) {
    const urlRegex = /(https?|ftp):\/\/[^\s/$.?#].[^\s]*/;
    const matches = string.match(urlRegex);

    if (matches) {
        for (const url of matches) {
            try {
                const { protocol } = new URL(url);
                if (protocol === 'http:' || protocol === 'https:') {
                    return true;
                }
            } catch (error) {
                // Ignore invalid URLs
            }
        }
    }

    return false;
}


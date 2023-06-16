import {
  BaseChannel,
  Guild,
  GuildTextBasedChannel,
  Message,
  PermissionFlagsBits,
} from 'discord.js';

import { FileManager } from './FileManager';
import { client } from './main';

export class DataRetriever {
    public fileManager: FileManager;
    constructor() {
        this.fileManager = new FileManager();
    }

    async fetchAndStoreAllMessagesInGuild(guild: Guild): Promise<void> {
        return new Promise(async (resolve) => {
            const channelPromises: Promise<void>[] = [];
            guild.channels.cache.forEach(async (channel: BaseChannel) => {
                try {
                    const canSeeChannel = (channel as GuildTextBasedChannel).permissionsFor(client.user).has(PermissionFlagsBits.ReadMessageHistory)
                    const canAccessChannel = (channel as GuildTextBasedChannel).permissionsFor(client.user).has(PermissionFlagsBits.SendMessages)
                    const canViewChannel = (channel as GuildTextBasedChannel).permissionsFor(client.user).has(PermissionFlagsBits.ViewChannel)
                    const isValidChannel = (!channel.isVoiceBased() && channel.isTextBased() && canSeeChannel && canAccessChannel && canViewChannel)

                    if (isValidChannel) {
                        //Gives the channel to be iterated for message fetching
                        //guild.id becomes the name of the file that stores messages as training data
                        const channelPromise = this.fetchAndStoreAllMessagesInChannel(
                            channel as GuildTextBasedChannel,
                            guild.id
                        );
                        channelPromises.push(channelPromise);
                    }
                } catch (error) {
                    console.error(`Error accessing channel`);
                }
            })
            await Promise.all(channelPromises);
            resolve();
        });
    }

    async fetchAndStoreAllMessagesInChannel(channel: GuildTextBasedChannel, fileName: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const MSG_LIMIT = 250000;
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
                            this.fileManager.appendMessageToFile(message, fileName)
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


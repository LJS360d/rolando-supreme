import { Message } from 'discord.js';
import {
  appendFileSync,
  close,
  open,
  PathLike,
  readFileSync,
  write,
} from 'fs';

export const DATA_FOLDER = './train_data/';
export function appendMessagesToFile(messages:string[],filePath:PathLike) {
    const uniqueMessages = new Set(messages);
  
    open(filePath, 'a', (err, fd) => {
      if (err) {
        console.error(`Error opening file: ${err}`);
      } else {
        let linesWritten = 0;
  
        const writeNextLine = () => {
          if (linesWritten < uniqueMessages.size) {
            const message = Array.from(uniqueMessages)[linesWritten];
            const line = message + '\n';
  
            write(fd, line, (writeErr) => {
              if (writeErr) {
                console.error(`Error writing to file: ${writeErr}`);
              } else {
                linesWritten++;
                writeNextLine(); // Write the next line recursively
              }
            });
          } else {
            close(fd, (closeErr) => {
              if (closeErr) {
                console.error(`Error closing file: ${closeErr}`);
              } else {
                console.log('File write completed.');
              }
            });
          }
        };
  
        writeNextLine(); // Start writing lines recursively
      }
    });
  }
export function appendMessageToFile(message: string, filePath: PathLike): void {
    appendFileSync(filePath, message + "\n");
}

export function readMessagesFromFile(filePath: PathLike): string[] {
  try {
    const fileContent: string = readFileSync(filePath, 'utf-8');
    const lines: string[] = fileContent.split('\n');

    console.log(`Lines read: ${lines.length}`);

    return lines;
  } catch (error) {
    console.error(`Error reading file: ${error}`);
    return [];
  }
}

export async function fetchAllMessages(channel: any, filePath: PathLike): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
        try {
            const messageLimit = 100000;
            const messages: string[] = [];
            let lastMessageID: string | undefined | null = null;
            let remaining = true;

            while (remaining && messages.length < messageLimit) {
                // Fetch a batch of messages
                const messageBatch: Message[] = await channel.messages.fetch({ limit: 100, before: lastMessageID });

                if (lastMessageID === undefined) {
                    // No more messages remaining
                    remaining = false;
                    continue;
                }

                // Add messages to the array
                messageBatch.forEach((msg: any) => {
                    const authorAndContent = `${msg.content}`;
                    if (!messages.includes(authorAndContent)) {
                        messages.push(authorAndContent);
                        appendMessageToFile(authorAndContent, filePath)
                    }
                });

                // Update the last message ID for the next batch
                lastMessageID = messageBatch.at(-1)?.id;
                console.log("Fetched Messages:" + messages.length);

            }
            resolve(messages);
        } catch (error) {
            console.error(`Error fetching messages: ${error}`);
            reject(`Error fetching messages: ${error}`);
        }
    });
}


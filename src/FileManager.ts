import {
  appendFileSync,
  PathLike,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'fs';

const DATA_FOLDER: PathLike = './train_data/';

export class FileManager {

  static getPreviousTrainingDataForGuild(guildId: string): string[] | null {
    //check if file guildId.dt exists
    if (FileManager.fileExists(`${DATA_FOLDER}${guildId}.dt`))
      return FileManager.readMessagesFromFile(guildId);
    return null;

  }

  static appendMessageToFile(msg: string, fileName: string): void {
    const cleanedMsg = msg.toLowerCase();
    appendFileSync(`${DATA_FOLDER}${fileName}.dt`, cleanedMsg + "\n");
  }

  static readMessagesFromFile(fileName: PathLike): string[] {
    try {
      const fileContent: string = readFileSync(`${DATA_FOLDER}${fileName}.dt`, 'utf-8');
      const lines: string[] = fileContent.split('\n');
      return lines;
    } catch (error) {
      console.error(`Error reading file: ${error}`);
      return [];
    }
  }

  static guildHasPreviousData(guildId: string): boolean {
    return FileManager.fileExists(`${DATA_FOLDER}${guildId}.dt`);
  }

  private static fileExists(filePath: PathLike): boolean {
    try {
      return statSync(filePath).isFile();
    } catch (error) {
      return false;
    }
  }

  static deleteOccurrences(stringToReplace: string, fileName: string): boolean {
    try {
      const fileContent = readFileSync(`${DATA_FOLDER}${fileName}.dt`, 'utf8');
      const updatedContent = fileContent.replace(new RegExp(stringToReplace, 'g'), '');
      writeFileSync(`${DATA_FOLDER}${fileName}.dt`, updatedContent, 'utf8');
      return (fileContent !== updatedContent)
    } catch (error) {
      return false
    }
  }

  static deleteGuildData(guildId: string): void {
    unlinkSync(`${DATA_FOLDER}${guildId}.dt`)
  }

  static saveReplyRate(replyRate: number, guildId: string): void {
    const data = `${guildId};${replyRate}\n`;
    const filePath = `${DATA_FOLDER}_reply_rates.dt`;

    if (!this.fileExists(filePath)) {
      writeFileSync(filePath, data, 'utf8');
      return;
    }

    const existingContent = readFileSync(filePath, 'utf8');
    const regex = new RegExp(`${guildId};\\d{1,}\\n`, 'gm');

    if (regex.test(existingContent)) {
      writeFileSync(filePath, existingContent.replace(regex, data), 'utf8');
      return;
    }

    appendFileSync(filePath, data, 'utf8');
  }

  static getReplyRate(guildId: string): number | undefined {
    const fileContent = readFileSync(`${DATA_FOLDER}_reply_rates.dt`, 'utf8');
    const regex = new RegExp(`${guildId};\\d{1,}\\n`, 'gm');
    const match = regex.exec(fileContent);

    if (match) {
      const replyRate = parseInt(match[0].split(';')[1].trim());
      return replyRate;
    }

    return undefined; // Return undefined if the guildId is not found
  }
  /* appendMessagesToFileNoDuplicates(messages: string[], filePath: PathLike) {
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
  } */
}
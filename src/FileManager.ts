import {
  appendFileSync,
  PathLike,
  readFileSync,
  statSync,
} from 'fs';

const DATA_FOLDER: PathLike = './train_data/';

export class FileManager {
  constructor() {

  }

  getPreviousTrainingDataForGuild(guildId: string): string[] | null {
    //check if file guildId.dt exists
    if (this.fileExists(`${DATA_FOLDER}${guildId}.dt`))
      return this.readMessagesFromFile(guildId);
    else return null;

  }

  appendMessageToFile(msg: string, fileName: string): void {
    const cleanedMsg = msg.toLowerCase();
    appendFileSync(`${DATA_FOLDER}${fileName}.dt`, cleanedMsg + "\n");
  }

  readMessagesFromFile(fileName: PathLike): string[] {
    try {
      const fileContent: string = readFileSync(`${DATA_FOLDER}${fileName}.dt`, 'utf-8');
      const lines: string[] = fileContent.split('\n');
      return lines;
    } catch (error) {
      console.error(`Error reading file: ${error}`);
      return [];
    }
  }

  guildHasPreviousData(guildId: string): boolean {
    return this.fileExists(`${DATA_FOLDER}${guildId}.dt`);
  }

  private fileExists(filePath: PathLike): boolean {
    try {
      return statSync(filePath).isFile();
    } catch (error) {
      return false;
    }
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
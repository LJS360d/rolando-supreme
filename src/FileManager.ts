import {
  appendFileSync,
  PathLike,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs';

const DATA_FOLDER: PathLike = './train_data/';

export class FileManager {

  static getPreviousTrainingDataForGuild(guildId: string): string[] | null {
    //check if file guildId.dt exists
    if (FileManager.fileExists(`${DATA_FOLDER}${guildId}.dt`))
      return FileManager.readMessagesFromFile(guildId);
    else return null;

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
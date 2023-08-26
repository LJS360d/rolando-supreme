import { PathLike } from 'fs';

export const MSG_LIMIT = 500000 as const;
export const USE_THRESHOLD = 15 as const;

export const DATA_FOLDER: PathLike = './train_data/';

export const JOIN_LABEL = `Hello, i'm Rolando.
I learn to type from the messages you send in chat
Run \`/providetraining\` to make me learn from all previous messages.
The more messages there are in the server, the more it will make me _intelligent_.` as const;
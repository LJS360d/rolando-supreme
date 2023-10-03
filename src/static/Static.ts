import { type PathLike } from 'fs';

export const MSG_LIMIT = 500000 as const;
export const USE_THRESHOLD = 15 as const;

export const DATA_FOLDER: PathLike = './train_data/' as const;
export const REPLYRATE_COMMAND_LABEL = (rate: string) =>
	`The reply rate is currently set to ${rate}\nUse \`/setreplyrate\` to change it`;

export const JOIN_LABEL = `Hello, i'm Rolando.
I learn to type from the messages you send in chat
Run \`/providetraining\` to make me learn from all previous messages.
The more messages there are in the server, the more it will make me _intelligent_.` as const;

export const PROVIDE_TRAINING_LABEL =
	"Are you sure you want to provide **ALL THE MESSAGES IN THE SERVER** as training data for me?\nThis will make me fetch all the channels i can access.\nIf you don't want me to learn from some channels, remove my permisions to type in them.";

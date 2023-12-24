import { ClientOptions } from 'discord.js';
import { Fonzi2Client, Handler } from 'fonzi2';
export class StarterKitClient extends Fonzi2Client {
	constructor(token: string, options: ClientOptions, handlers: Handler[]) {
		super(token, options, handlers);
	}
}

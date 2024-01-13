import { Fonzi2Client, getRegisteredCommands, Logger } from 'fonzi2';
import { connectMongo } from './domain/repositories/mongo.connector';
import { ChainService } from './domain/services/chain.service';
import { env } from './env';
import { ButtonsHandler } from './handlers/buttons.handler';
import { CommandsHandler } from './handlers/commands.handler';
import { EventsHandler } from './handlers/events.handler';
import { MessageHandler } from './handlers/message.handler';
import options from './options';
import { GuildsService } from './domain/services/guilds.service';
import { GuildsRepository } from './domain/repositories/guilds.repository';
async function main() {
	const db = await connectMongo(env.MONGODB_URI);

	const chainService = new ChainService(new GuildsRepository());
	const guildsService = new GuildsService(new GuildsRepository());

	new Fonzi2Client(env.TOKEN, options, [
		new CommandsHandler(chainService, guildsService),
		new ButtonsHandler(chainService, guildsService),
		new MessageHandler(chainService, guildsService),
		new EventsHandler(getRegisteredCommands(), chainService, guildsService),
	]);

	process.on('uncaughtException', (err: any) => {
		if (err?.response?.status !== 429)
			Logger.error(`${err.name}: ${err.message}\n${err.stack}`);
	});

	process.on('unhandledRejection', (reason: any) => {
		if (reason?.status === 429) return;
		if (reason?.response?.status === 429) return;
	});

	['SIGINT', 'SIGTERM'].forEach((signal) => {
		process.on(signal, async () => {
			Logger.warn(
				`Received ${signal} signal, closing &u${db?.name}$ database connection`
			);
			await db?.close();
			process.exit(0);
		});
	});
}

void main();

import { Fonzi2Client, getRegisteredCommands, Logger } from 'fonzi2';
import { connectMongo } from './domain/repositories/common/mongo.connector';
import { TextDataRepository } from './domain/repositories/fs-storage/text-data.repository';
import { GuildsRepository } from './domain/repositories/guild/guilds.repository';
import { ChainsService } from './domain/services/chains.service';
import { GuildsService } from './domain/services/guilds.service';
import { env, validateEnv } from './env';
import { ButtonsHandler } from './handlers/buttons.handler';
import { CommandsHandler } from './handlers/commands.handler';
import { EventsHandler } from './handlers/events.handler';
import { MessageHandler } from './handlers/message.handler';
import options from './options';
import Container from 'typedi';
async function main() {
	validateEnv();
	const db = await connectMongo(env.MONGODB_URI, 'rolando-supreme');

	const guildsRepository = new GuildsRepository();
	Container.set(GuildsRepository, guildsRepository);
	const textDataRepository = new TextDataRepository();
	Container.set(TextDataRepository, textDataRepository);
	const chainsService = new ChainsService(guildsRepository, textDataRepository);
	Container.set(ChainsService, chainsService);
	const guildsService = new GuildsService(guildsRepository);
	Container.set(GuildsService, guildsService);

	new Fonzi2Client(env.TOKEN, options, [
		new CommandsHandler(chainsService, guildsService),
		new ButtonsHandler(chainsService, guildsService),
		new MessageHandler(chainsService, guildsService),
		new EventsHandler(getRegisteredCommands(), guildsService, chainsService),
	]);

	process.on('uncaughtException', (err: any) => {
		if (err?.response?.status !== 429)
			Logger.error(`${err.name}: ${err.message}\n${err.stack}`);
	});

	process.on('unhandledRejection', (reason: any) => {
		if (reason?.status === 429) return;
		if (reason?.response?.status === 429) return;
		Logger.error(reason);
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

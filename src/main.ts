import { getRegisteredCommands } from 'fonzi2';
import { StarterKitClient } from './client/client';
import env from './env';
import ClientEventsHandler from './handlers/client.events.handler';
import options from './options';
new StarterKitClient(env.TOKEN, options, [
	new ClientEventsHandler(getRegisteredCommands()),
]);

process.on('unhandledRejection', (reason: any) => {
	if (reason?.status === 429) return;
});

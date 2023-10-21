import express, { type Request, type Response } from 'express';
import http from 'http';

import { DataRetriever } from './rolando/discord/DataRetriever';
import { client } from './main';
import { chainsMap } from './rolando/model/MarkovChain';
import { getRequestLog, serv } from './utils/Logging';

export function startAdminServer() {
	const startTime = Date.now();
	const app: express.Application = express();
	const httpServer: http.Server = http.createServer(app);
	app.use(express.static('public'));
	app.set('view engine', 'ejs');
	const rootEndpoint = `/`;
	app.get(rootEndpoint, (req: Request, res: Response) => {
		getRequestLog(req.url);
		const props = {
			client,
			guilds: client.guilds.cache,
			chains: chainsMap,
			startTime,
			version: process.env.npm_package_version,
			fetchStatus: DataRetriever.fetchStatus,
		};
		res.render('admin', props);
	});
	client.guilds.cache.forEach((guild) => {
		const endpoint = `/${guild.name.toLowerCase().replace(/ /g, '_')}`;
		app.get(endpoint, (req: Request, res: Response) => {
			getRequestLog(req.url);
			res.json(chainsMap.get(guild.id)!);
		});
	});

	// Const PORT: number | string = process.env.PORT || 8080;
	const PORT = 8080;
	httpServer.listen(PORT, () => {
		serv(`Server listening on port ${PORT}`);
	});
}

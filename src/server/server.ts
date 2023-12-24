import { Client } from 'discord.js';
import express, { Request, Response } from 'express';
import { Fonzi2Server, Fonzi2ServerData } from 'fonzi2';
import { resolve } from 'path';
export class StarterKitServer extends Fonzi2Server {
	constructor(client: Client, data: Fonzi2ServerData) {
		super(client, data);
		this.app.use(express.static(resolve('public')));
		this.app.set('views', [this.app.get('views'), resolve('views')]);
	}

	override start(): void {
		this.app.get('/data', this.dataPage.bind(this));
		this.httpServer.on('request', (req, res) => {
			// Logger.trace(`[${req.method}] ${req.url} ${res.statusCode}`);
		});
		super.start();
	}

	async dataPage(req: Request, res: Response) {
		const props = {
			data: this.data,
			routes: this.getAllRoutes(),
		};
		res.render('data', props);
	}

	private getAllRoutes(): { route: string; method: string }[] {
		const routesRaw: { path: string; stack: { name: string; method: string }[] }[] =
			this.app._router.stack.map((r) => r.route).filter(Boolean);
		return routesRaw.map(({ path, stack }) => ({ route: path, method: stack[0].method }));
	}
}

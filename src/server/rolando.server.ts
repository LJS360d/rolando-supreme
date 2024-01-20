import { Client } from 'discord.js';
import express, { Request, Response } from 'express';
import { Fonzi2Server, Fonzi2ServerData } from 'fonzi2';
import { resolve } from 'path';
import { ChainsService } from '../domain/services/chains.service';
import { ActionsController } from './controllers/actions.controller';
import { HxController } from './controllers/hx.controller';
import { ViewsController } from './controllers/views.controller';
import { baseRenderOptions } from './render';
import { Props, RenderOptions } from './types/render-options';

export class RolandoServer extends Fonzi2Server {
	constructor(
		client: Client,
		data: Fonzi2ServerData,
		private chainsService: ChainsService
	) {
		super(client, data);
		this.app.use(express.static(resolve('public')));
		this.app.set('views', [this.app.get('views'), resolve('views')]);
		this.httpServer.on('request', (req, res) => {
			// Logger.trace(`[${req.method}] ${req.url} ${res.statusCode}`);
		});
	}

	override async start() {
		new ActionsController(this.app, this.chainsService);
		new HxController(this.app, this.chainsService);
		new ViewsController(this.app, this.chainsService);
		super.start();
	}

	override async dashboard(req: Request, res: Response) {
		const userInfo = req.session!['userInfo'];
		if (!userInfo) {
			res.redirect('/unauthorized');
			return;
		}
		const props = {
			client: this.client,
			guilds: this.client.guilds.cache,
			startTime: this.startTime,
			inviteLink: this.data.inviteLink,
			// ? rolando
			chains: this.chainsService.getAllChains(),
		};
		const options = {
			userInfo,
		};
		this.render(res, 'pages/dashboard', props, options);
		return;
	}

	// ? for default routes override
	private render(
		res: Response,
		component: string,
		props: Props,
		options?: Partial<RenderOptions>
	) {
		options = { ...baseRenderOptions, ...options };
		res.render('index', {
			component,
			props,
			...options,
		});
	}
}

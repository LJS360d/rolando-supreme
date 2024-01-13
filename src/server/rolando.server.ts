import { Client } from 'discord.js';
import express, { Request, Response } from 'express';
import { Fonzi2Server, Fonzi2ServerData } from 'fonzi2';
import { resolve } from 'path';
import { ChainService } from '../domain/services/chain.service';

export class RolandoServer extends Fonzi2Server {
	constructor(
		client: Client,
		data: Fonzi2ServerData,
		private chainsService: ChainService
	) {
		super(client, data);
		this.app.use(express.static(resolve('public')));
		this.app.set('views', [this.app.get('views'), resolve('views')]);
	}

	override start(): void {
		//? Add new endpoints and pages here

		this.httpServer.on('request', (req, res) => {
			// Logger.trace(`[${req.method}] ${req.url} ${res.statusCode}`);
		});
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
			version: this.data.version,
			inviteLink: this.data.inviteLink,
			userInfo,
			// ? rolando
			analytics: this.chainsService.chain.analytics,
			getGuildContribution: this.chainsService.getGuildContribution.bind(
				this.chainsService
			),
		};
		this.render(res, 'pages/dashboard', props);
	}

	private render(res: Response, page: string, props: any, options?: any) {
		const defaultOptions = {
			themes: [
				'dark',
				'dim',
				'dracula',
				'business',
				'night',
				'lemonade',
				'wireframe',
				'pastel',
				'fantasy',
				'light',
			],
			theme: 'dark',
			title: 'Fonzi2 Starter Kit',
			props,
		};
		res.render('index', {
			component: page,
			...{ ...defaultOptions, ...options },
		});
	}
}

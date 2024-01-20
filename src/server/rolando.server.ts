import { Client } from 'discord.js';
import express, { Request, Response } from 'express';
import { Fonzi2Server, Fonzi2ServerData, Logger } from 'fonzi2';
import { resolve } from 'path';
import 'reflect-metadata';
import { useContainer, useExpressServer } from 'routing-controllers';
import { Container } from 'typedi';
import { ChainsService } from '../domain/services/chains.service';
import { env } from '../env';
import { ActionsController } from './controllers/actions.controller';
import { HxController } from './controllers/hx.controller';
import { ViewsController } from './controllers/views.controller';
import { baseRenderOptions } from './render';

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
		useContainer(Container);
		useExpressServer(this.app, {
			controllers: this.getRegisteredControllers(),
			cors: true,
			development: env.NODE_ENV === 'development',
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

	private getRegisteredControllers() {
		return [ActionsController, ViewsController, HxController];
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

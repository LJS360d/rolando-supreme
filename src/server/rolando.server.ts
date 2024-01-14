import { HttpStatusCode } from 'axios';
import { Client } from 'discord.js';
import express, { Request, Response } from 'express';
import { Fonzi2Server, Fonzi2ServerData, Logger } from 'fonzi2';
import { resolve } from 'path';
import { ChainService } from '../domain/services/chain.service';
import { formatNumber, percentOf } from '../utils/formatting.utils';
import { getSection } from '../utils/random.utils';

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
		this.app.get('/media', this.media.bind(this));
		this.app.delete('/data', this.removeData.bind(this));
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
			formatNumber,
			percentOf,
			getGuildContribution: this.chainsService.getGuildContribution.bind(
				this.chainsService
			),
		};
		this.render(res, 'pages/dashboard', props);
	}

	async media(req: Request, res: Response) {
		const { media, start, end } = req.query;
		if (media && typeof media === 'string') {
			const props = {
				mediaType: media,
				media: this.chainsService.chain.mediaStorage[media ?? 'images'],
				getSection,
				wipe: this.chainsService.chain.delete.bind(this.chainsService.chain),
				start: start ? Number(start) : 0,
				end: end ? Number(end) : 80,
			};
			this.render(res, 'pages/media', props);
			return;
		}
		res.sendStatus(HttpStatusCode.BadRequest);
	}

	async removeData(req: Request, res: Response) {
		const userInfo = req.session!['userInfo'];
		if (!userInfo) {
			res.sendStatus(HttpStatusCode.Unauthorized);
			return;
		}
		const { text } = req.query;

		if (typeof text === 'string') {
			void this.chainsService.removeData(text);
			void this.chainsService.removeData(encodeURIComponent(text));
			res.sendStatus(HttpStatusCode.NoContent);
			return;
		}
	}

	private render(res: Response, page: string, props: any, options?: any) {
		const themes = [
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
		];
		const defaultOptions = {
			themes,
			theme: themes[0],
			title: 'Rolando Supreme',
			routes: this.getRoutes(),
			props,
		};
		res.render('index', {
			component: page,
			...{ ...defaultOptions, ...options },
		});
	}

	private getRoutes(): Route[] {
		return [
			{
				name: 'Dashboard',
				path: '/dashboard',
				icon: 'home',
				admin: true,
			},
			{
				name: 'Gifs',
				path: '/media?media=gifs',
				icon: 'photo-film',
			},
			{
				name: 'Images',
				path: '/media?media=images',
				icon: 'photo-film',
			},
			{
				name: 'Videos',
				path: '/media?media=videos',
				icon: 'play',
			},
		];
	}
}

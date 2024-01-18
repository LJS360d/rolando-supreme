import { HttpStatusCode } from 'axios';
import { Client } from 'discord.js';
import express, { Request, Response } from 'express';
import { Fonzi2Server, Fonzi2ServerData } from 'fonzi2';
import { resolve } from 'path';
import { ChainsService } from '../domain/services/chains.service';
import { Language } from '../domain/types/languages';
import { formatNumber, percentOf } from '../utils/formatting.utils';
import { getSection } from '../utils/random.utils';
import { HxServer } from './hx.server';

type MediaUnion = 'gifs' | 'images' | 'videos';

export class RolandoServer extends Fonzi2Server {
	hxServer: HxServer;
	constructor(
		client: Client,
		data: Fonzi2ServerData,
		private chainsService: ChainsService
	) {
		super(client, data);
		this.app.use(express.static(resolve('public')));
		this.app.set('views', [this.app.get('views'), resolve('views')]);
		this.hxServer = new HxServer(this.app, this.chainsService);
	}

	override start(): void {
		//? Add new endpoints and pages here
		this.app.get('/media', this.media.bind(this));
		this.app.get('/chat', this.chat.bind(this));
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
			chains: this.chainsService.getAllChains(),
		};
		this.render(res, 'pages/dashboard', props);
	}

	async media(
		req: Request<
			any,
			any,
			any,
			{ lang: Language; media: MediaUnion; start: number; end: number }
		>,
		res: Response
	) {
		const { lang, media, start, end } = req.query;
		if (media && typeof media === 'string') {
			const chain = this.chainsService.getChain(lang);
			const props = {
				mediaType: media,
				media: chain.mediaStorage[media ?? 'images'],
				getSection,
				wipe: chain.delete.bind(chain),
				start: start ? Number(start) : 0,
				end: end ? Number(end) : 80,
			};
			this.render(res, 'pages/media', props);
			return;
		}
		res.sendStatus(HttpStatusCode.BadRequest);
	}

	async chat(req: Request<any, any, any, { lang: Language }>, res: Response) {
		const userInfo = req.session!['userInfo'];
		if (!userInfo) {
			res.redirect('/unauthorized');
			return;
		}

		const { lang } = req.query;

		const props = {
			chain: this.chainsService.getChain(lang),
		};
		this.render(res, 'pages/chat', props);
	}

	async removeData(
		req: Request<any, any, any, { lang: Language; text: string }>,
		res: Response
	) {
		const userInfo = req.session!['userInfo'];
		if (!userInfo) {
			res.sendStatus(HttpStatusCode.Unauthorized);
			return;
		}
		const { lang, text } = req.query;
		void this.chainsService.removeData(lang, text);
		void this.chainsService.removeData(lang, encodeURIComponent(text));
		res.sendStatus(HttpStatusCode.NoContent);
		return;
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
				name: 'Chat',
				path: '/chat?lang=eng',
				icon: 'comment',
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

import { Application, Request, Response } from 'express';
import { ChainsService } from '../../domain/services/chains.service';
import { Language } from '../../static/languages';
import { Media } from '../../static/media';
import { render } from '../render';

export class ViewsController {
	constructor(
		private app: Application,
		private chainsService: ChainsService
	) {
		this.app.get('/media/:type', this.media.bind(this));
		this.app.get('/chat/:lang', this.chat.bind(this));
	}

	async media(
		req: Request<
			{ type: Media },
			any,
			any,
			{ lang: Language; start: number; end: number }
		>,
		res: Response
	) {
		const userInfo = req.session!['userInfo'];
		let { type } = req.params;
		let { lang, start, end } = req.query;
		lang ??= Language.english;
		type ??= Media.Images;
		start ??= 0;
		end ??= 80;
		const chain = this.chainsService.getChain(lang);
		const media = Array.from(chain.mediaStorage[type]).slice(start, end);
		const props = {
			start,
			end,
			lang,
			media,
			langs: this.chainsService.getAllChains().map((c) => c.id),
		};
		const options = {
			userInfo,
		};
		return await render(res, 'pages/media', props, options);
	}

	async chat(req: Request<{ lang: Language }>, res: Response) {
		const userInfo = req.session!['userInfo'];
		if (!userInfo) {
			res.redirect('/unauthorized');
			return;
		}
		const { lang } = req.params;
		const props = {
			lang,
			langs: this.chainsService.getAllChains().map((c) => c.id),
		};
		const options = {
			userInfo,
		};
		return await render(res, 'pages/chat', props, options);
	}
}

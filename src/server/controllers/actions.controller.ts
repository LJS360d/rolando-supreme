import { Application, Request, Response } from 'express';
import { ChainsService } from '../../domain/services/chains.service';
import { Language } from '../../static/languages';

export class ActionsController {
	constructor(
		private app: Application,
		private chainsService: ChainsService
	) {
		this.app.delete('/data/:lang', this.removeData.bind(this));
	}

	async removeData(
		req: Request<{ lang: Language }, any, any, { text: string }>,
		res: Response
	) {
		const { lang } = req.params;
		const { text } = req.query;
		if (!text || !lang) {
			res.status(400).send('Missing parameters');
			return;
		}
		this.chainsService.removeData(lang, text);
		res.sendStatus(204);
		return;
	}
}

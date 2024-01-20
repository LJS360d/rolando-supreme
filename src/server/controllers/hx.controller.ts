import { Application, Request, Response } from 'express';
import { ChainsService } from '../../domain/services/chains.service';
import { Language } from '../../static/languages';
import { hxRender } from '../render';

export class HxController {
	constructor(
		private app: Application,
		private chainService: ChainsService
	) {
		this.app.get('/hx/message', this.message.bind(this));
	}

	async message(req: Request<any, any, any, { lang: Language }>, res: Response) {
		const { lang } = req.query;
		const responseMsg = this.chainService.getChain(lang).talk(200);
		const props = {
			response: responseMsg,
		};
		hxRender(res, 'message', props);
		return;
	}
}

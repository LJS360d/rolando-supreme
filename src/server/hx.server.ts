import { Application, Request, Response } from 'express';
import { ChainsService } from '../domain/services/chains.service';

export class HxServer {
	constructor(
		private app: Application,
		private chainService: ChainsService
	) {
		this.app.get('/message', this.message.bind(this));
	}

	async message(req: Request, res: Response) {
		/* const { msg } = req.query; */
		const responseMsg = this.chainService.chain.talk(200);
		const props = {
			response: responseMsg,
		};
		res.render('hx/message', props);
	}
}

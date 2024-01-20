import { Controller, Get, QueryParam } from 'routing-controllers';
import { Service } from 'typedi';
import { ChainsService } from '../../domain/services/chains.service';
import { hxRender, render } from '../render';

@Controller('/hx')
export class HxController {
	constructor(@Service() private chainService: ChainsService) {}

	@Get('/message')
	async message(@QueryParam('lang') lang: string) {
		const responseMsg = this.chainService.getChain(lang).talk(200);
		const props = {
			response: responseMsg,
		};
		return hxRender('message', props);
	}
}

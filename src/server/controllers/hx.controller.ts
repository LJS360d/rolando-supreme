import { Controller, Get, QueryParam } from 'routing-controllers';
import { ChainsService } from '../../domain/services/chains.service';
import { Language } from '../../static/languages';
import { render } from '../render';

@Controller('/hx')
export class HxController {
	constructor(private chainService: ChainsService) {}

	@Get('/message')
	async message(@QueryParam('lang') lang: Language) {
		const responseMsg = this.chainService.getChain(lang).talk(200);
		const props = {
			response: responseMsg,
		};
		return render('hx/message', props);
	}
}

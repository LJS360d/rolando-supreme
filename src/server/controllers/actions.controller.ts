import { Delete, JsonController, Param, UseInterceptor } from 'routing-controllers';
import { Language } from '../../static/languages';
import { SessionAuthGuard } from '../guards/session.auth.guard';

@JsonController()
export class ActionsController {
	// TODO use auth guard
	@Delete('/data/:lang')
	@UseInterceptor(SessionAuthGuard)
	async removeData(@Param('lang') lang: Language) {
		// TODO impl
	}
}

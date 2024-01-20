import {
	Authorized,
	Delete,
	HttpCode,
	JsonController,
	Param,
	QueryParam,
} from 'routing-controllers';
import { Service } from 'typedi';
import { ChainsService } from '../../domain/services/chains.service';
import { Language, LanguageUndefined, isLanguage } from '../../static/languages';

@JsonController()
export class ActionsController {
	constructor(@Service() private chainsService: ChainsService) {}

	@Delete('/data/:lang')
	@HttpCode(204)
	@Authorized()
	async removeData(@Param('lang') lang: string, @QueryParam('text') text: string) {
		lang ??= Language.english;
		if (!isLanguage(lang)) lang = LanguageUndefined;
		this.chainsService.removeData(lang, text);
		return null;
	}
}

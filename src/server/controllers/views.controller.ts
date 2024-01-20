import { DiscordUserInfo } from 'fonzi2/dist/types/discord.user.info';
import {
	Authorized,
	Controller,
	Get,
	Param,
	QueryParam,
	Session,
} from 'routing-controllers';
import { Service } from 'typedi';
import { ChainsService } from '../../domain/services/chains.service';
import { Language, LanguageUndefined, isLanguage } from '../../static/languages';
import { Media } from '../../static/media';
import { render } from '../render';

@Controller()
export class ViewsController {
	constructor(@Service() private chainsService: ChainsService) {}

	@Get('/media/:type')
	async media(
		@Session() session: { userInfo?: DiscordUserInfo },
		@Param('type') type?: string,
		@QueryParam('lang') lang?: string,
		@QueryParam('start') start?: number | null,
		@QueryParam('end') end?: number | null
	) {
		lang ??= Language.english;
		if (!isLanguage(lang)) lang = LanguageUndefined;
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
			userInfo: session.userInfo,
		};
		return await render('pages/media', props, options);
	}

	@Get('/chat/:lang')
	@Authorized()
	async chat(
		@Session() session: { userInfo?: DiscordUserInfo },
		@Param('lang') lang: string
	) {
		if (!isLanguage(lang)) lang = LanguageUndefined;
		const props = {
			lang,
			langs: this.chainsService.getAllChains().map((c) => c.id),
		};
		const options = {
			userInfo: session.userInfo,
		};
		return await render('pages/chat', props, options);
	}
}

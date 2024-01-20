import { Controller, Get, Param, QueryParam, Res, Session } from 'routing-controllers';
import { Service } from 'typedi';
import { ChainsService } from '../../domain/services/chains.service';
import { render } from '../render';
import { Response } from 'express';
import { DiscordUserInfo } from 'fonzi2/dist/types/discord.user.info';

@Controller()
export class ViewsController {
	constructor(@Service() private chainsService: ChainsService) {}

	@Get('/hi')
	hi() {
		return 'hi';
	}

	@Get('/media/:type')
	async media(
		@QueryParam('lang') lang: string,
		@Param('type') type: 'gifs' | 'images' | 'videos',
		@Session() session: { userInfo?: DiscordUserInfo }
	) {
		const chain = this.chainsService.getChain(lang);
		const props = {
			mediaType: type,
			media: chain.mediaStorage[type ?? 'images'],
			wipe: chain.delete.bind(chain),
		};
		const options = {
			userInfo: session.userInfo,
		};
		return await render('pages/media', props, options);
	}

	/* async chat(req: Request<any, any, any, { lang: Language }>, res: Response) {
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
	} */
}

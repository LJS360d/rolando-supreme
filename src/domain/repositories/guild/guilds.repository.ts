import { LanguageUndefined } from '../../../static/languages';
import { BaseRepository } from '../common/base.repository';
import { GuildDocument, GuildModel } from './models/guild.model';

export class GuildsRepository extends BaseRepository<GuildDocument> {
	override entity = GuildModel;

	async getGuildLanguage(guildId: string) {
		const guildDoc = await this.getOne(guildId);
		return guildDoc?.language ?? LanguageUndefined;
	}
}

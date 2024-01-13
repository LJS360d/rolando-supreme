import { Guild } from 'discord.js';
import { GuildsRepository } from '../repositories/guilds.repository';
import { Logger } from 'fonzi2';

export class GuildsService {
	constructor(private guildsRepository: GuildsRepository) {}

	saveTextData(guildId: string, text: string | string[]) {
		return this.guildsRepository.saveTextData(guildId, text);
	}

	async getOne(guild: Guild) {
		const guildDocument = await this.guildsRepository.getOne(guild.id);
		return guildDocument ?? this.create(guild);
	}

	async getAll() {
		return this.guildsRepository.getAll();
	}

	async create(guild: Guild, replyRate?: number) {
		Logger.info(`Creating guild document, id: ${guild.id}`);
		return this.guildsRepository.create(guild, replyRate);
	}

	async update(guild: Guild, replyRate?: number, contributed?: boolean) {
		return this.guildsRepository.update(guild, replyRate, contributed);
	}

	async delete(guildId: string) {
		return this.guildsRepository.delete(guildId);
	}
}

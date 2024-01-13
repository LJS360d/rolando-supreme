import { Guild } from 'discord.js';
import { GuildsRepository } from '../repositories/guilds.repository';
import { Logger } from 'fonzi2';

export class GuildsService {
	constructor(private guildsRepository: GuildsRepository) {}

	saveTextData(guildId: string, text: string | string[]) {
		return this.guildsRepository.saveTextData(guildId, text);
	}

	async getOne(guildId: string) {
		return this.guildsRepository.getOne(guildId);
	}

	async getAll() {
		return this.guildsRepository.getAll();
	}

	async create(guild: Guild, replyRate?: number) {
		Logger.info(`Creating guild document, id: ${guild.id}`);
		return this.guildsRepository.create(guild, replyRate);
	}

	async update(guild: Guild, replyRate?: number) {
		return this.guildsRepository.update(guild, replyRate);
	}

	async delete(guildId: string) {
		return this.guildsRepository.delete(guildId);
	}
}

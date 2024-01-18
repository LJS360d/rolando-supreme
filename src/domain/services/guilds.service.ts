import { Guild } from 'discord.js';
import { Logger } from 'fonzi2';
import { UpdateQuery } from 'mongoose';
import { GuildsRepository } from '../repositories/guild/guilds.repository';
import { GuildDocument } from '../repositories/guild/models/guild.model';
import { Language } from '../types/languages';

export class GuildsService {
	constructor(private guildsRepository: GuildsRepository) {}

	async getGuildLanguage(guildId: string) {
		const guildDocument = await this.guildsRepository.getOne(guildId);
		return guildDocument?.language ?? 'und';
	}

	async getOne(guild: Guild) {
		const guildDocument = await this.guildsRepository.getOne(guild.id);
		return guildDocument ?? this.create(guild);
	}

	async getAll() {
		return this.guildsRepository.getAll();
	}

	async create(guild: Guild, replyRate?: number) {
		Logger.info(`Creating guild document for '${guild.name}'`);
		const createObj = {
			id: guild.id,
			replyRate: replyRate ?? 10,
			contributed: false,
			name: guild.name,
			language: Language.english,
		};
		return this.guildsRepository.create(createObj);
	}

	async update(guild: Guild, ...fields: any[]) {
		const updateObj: UpdateQuery<GuildDocument> = {
			name: guild.name,
			...fields,
		};
		return this.guildsRepository.update(guild.id, updateObj);
	}

	async delete(guildId: string) {
		return this.guildsRepository.delete(guildId);
	}
}

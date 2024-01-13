import { Guild } from 'discord.js';
import { Logger } from 'fonzi2';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { now } from 'mongoose';
import { join } from 'path';
import { GuildModel } from './models/guild.model';

export class GuildsRepository {
	private readonly dataFolder = join(process.cwd(), 'messages');
	private readonly fileEncoding = 'utf-8';
	constructor() {}

	async getAll() {
		return await GuildModel.find();
	}

	async getOne(id: string) {
		return await GuildModel.findOne({ id });
	}

	async create(guild: Guild, replyRate: number = 10) {
		if (!existsSync(this.dataFolder)) mkdirSync(this.dataFolder);
		const storagePath = join(this.dataFolder, `${guild.id}.txt`);
		writeFileSync(storagePath, '', this.fileEncoding);

		return await GuildModel.create({
			id: guild.id,
			replyRate: replyRate,
			storagePath,
			name: guild.name,
			updatedAt: now(),
		});
	}

	async update(guild: Guild, replyRate?: number) {
		return await GuildModel.updateOne(
			{ id: guild.id },
			{ replyRate: replyRate, name: guild.name, updatedAt: now() }
		);
	}

	saveTextData(guildId: string, text: string | string[]): void {
		const messagesFilepath = join(this.dataFolder, `${guildId}.txt`);
		const fileContent: string = readFileSync(messagesFilepath, this.fileEncoding);
		if (typeof text === 'string') {
			writeFileSync(messagesFilepath, `${fileContent}\n${text}`, this.fileEncoding);
			return;
		}
		writeFileSync(
			messagesFilepath,
			`${fileContent}\n${text.join('\n')}`,
			this.fileEncoding
		);
	}

	getGuildTextData(messagesFilepath: string) {
		try {
			const fileContent: string = readFileSync(messagesFilepath, this.fileEncoding);
			return fileContent.split('\n');
		} catch (_) {
			Logger.warn(`Could not read ${messagesFilepath}`);
			if (!existsSync(messagesFilepath)) {
				writeFileSync(messagesFilepath, '', this.fileEncoding);
				Logger.info(`Created storage file at ${messagesFilepath}`);
			}
			return [];
		}
	}

	async delete(id: string) {
		await GuildModel.deleteOne({ id });
		return;
	}
}

import { Guild } from 'discord.js';
import { Logger } from 'fonzi2';
import {
	appendFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	writeFileSync,
} from 'fs';
import { now } from 'mongoose';
import { join } from 'path';
import { GuildModel } from './models/guild.model';

export class GuildsRepository {
	private readonly dataFolder = join(process.cwd(), '/data');
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

	async update(guild: Guild, replyRate?: number, contributed?: boolean) {
		return await GuildModel.updateOne(
			{ id: guild.id },
			{
				replyRate: replyRate,
				name: guild.name,
				updatedAt: now(),
				contributed: contributed,
			}
		);
	}

	saveTextData(guildId: string, text: string | string[]): void {
		if (!existsSync(this.dataFolder)) mkdirSync(this.dataFolder);
		const messagesFilepath = join(this.dataFolder, `${guildId}.txt`);
		if (!existsSync(messagesFilepath)) writeFileSync(messagesFilepath, '');
		if (typeof text === 'string') {
			appendFileSync(messagesFilepath, text + '\n', this.fileEncoding);
			return;
		}
		appendFileSync(messagesFilepath, text.join('\n'), this.fileEncoding);
	}

	async deleteTextData(text: string) {
		await Promise.all(
			readdirSync(this.dataFolder).map(async (file) => {
				const filePath = join(this.dataFolder, file);
				const fileContent = readFileSync(filePath, 'utf-8');
				if (fileContent.includes(text)) {
					const newContent = fileContent.replace(new RegExp(text, 'g'), '');
					writeFileSync(filePath, newContent, 'utf-8');
				}
			})
		);
	}

	getGuildTextData(guildId: string) {
		const messagesFilepath = join(this.dataFolder, `${guildId}.txt`);
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

	getGuildContribution(guildId: string) {
		try {
			const messagesFilepath = join(this.dataFolder, `${guildId}.txt`);
			const fileContent: string = readFileSync(messagesFilepath, this.fileEncoding);
			return fileContent.split('\n').length;
		} catch (error) {
			return 0;
		}
	}

	async delete(id: string) {
		await GuildModel.deleteOne({ id });
		return;
	}
}

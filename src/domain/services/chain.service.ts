import { Logger } from 'fonzi2';
import { MarkovChain } from '../model/markov.chain';
import { GuildsRepository } from '../repositories/guilds.repository';

export class ChainService {
	readonly chain: MarkovChain = new MarkovChain('supreme');

	constructor(private guildsRepository: GuildsRepository) {
		this.loadChain();
	}

	updateChain(text: string | string[], guildId: string) {
		if (typeof text === 'string') {
			this.chain.updateState(text);
			this.guildsRepository.saveTextData(guildId, text);
			return this.chain;
		}
		this.chain.provideData(text);
		this.guildsRepository.saveTextData(guildId, text);
		return this.chain;
	}

	async loadChain(): Promise<MarkovChain> {
		const load = Logger.loading('Loading Supreme Chain...');
		const guilds = await this.guildsRepository.getAll();
		for (const guild of guilds) {
			const messages = this.guildsRepository.getGuildTextData(guild.storagePath);
			this.chain.provideData(messages);
		}
		load.success(`Loaded Supreme chain, Size: #green${this.chain.size}$`);
		return this.chain;
	}
}

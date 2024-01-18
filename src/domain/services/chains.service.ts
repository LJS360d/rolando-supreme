import { Logger } from 'fonzi2';
import { MarkovChain } from '../model/markov.chain';
import { GuildsRepository } from '../repositories/guild/guilds.repository';
import { TextDataRepository } from '../repositories/fs-storage/text-data.repository';

export class ChainsService {
	public readonly chainsMap: Map<string, MarkovChain> = new Map();

	constructor(
		private guildsRepository: GuildsRepository,
		private textDataRepository: TextDataRepository
	) {
		this.loadChains();
	}

	async getChainForGuild(guildId: string) {
		const lang = await this.guildsRepository.getGuildLanguage(guildId);
		const chain = this.chainsMap.get(lang);
		return chain;
	}

	getChain(lang: string) {
		const chain = this.chainsMap.get(lang);
		if (chain) return chain;
		return this.createChain(lang);
	}

	createChain(lang: string): MarkovChain {
		const textData = this.textDataRepository.getTextData(lang);
		const chain = new MarkovChain(lang, textData);
		this.chainsMap.set(lang, chain);
		return chain;
	}

	updateChain(lang: string, text: string | string[]) {
		const chain = this.getChain(lang);
		if (!chain) return 0;
		if (typeof text === 'string') {
			chain.updateState(text);
			this.textDataRepository.saveTextData(lang, text);
			return 1;
		}
		chain.provideData(text);
		this.textDataRepository.saveTextData(lang, text);
		return text.length;
	}

	async removeData(lang: string, text: string) {
		const chain = this.chainsMap.get(lang);
		if (!chain) return 0;
		chain.delete(text);
		this.textDataRepository.deleteTextData(lang, text);
		return 1;
	}

	loadChains() {
		const load = Logger.loading('Loading Chains...');
		for (const lang of this.textDataRepository.getStorageRefs()) {
			this.createChain(lang);
		}
		load.success(`Loaded ${this.textDataRepository.getStorageRefs().length} chains`);
		this.chainsMap.forEach((chain) => {
			Logger.info(`Chain '${chain.id}' size: #green${chain.size}$`);
		});
	}
}

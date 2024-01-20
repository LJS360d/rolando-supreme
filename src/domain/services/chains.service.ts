import { Logger } from 'fonzi2';
import { MarkovChain } from '../model/markov.chain';
import { GuildsRepository } from '../repositories/guild/guilds.repository';
import { TextDataRepository } from '../repositories/fs-storage/text-data.repository';
import { LanguageUndefined } from '../../static/languages';

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
		return chain ?? this.getChain(LanguageUndefined);
	}

	getChain(lang: string) {
		const chain = this.chainsMap.get(lang);
		if (chain) return chain;
		return this.createChain(lang);
	}

	getAllChains() {
		return [...this.chainsMap.values()];
	}

	createChain(lang: string): MarkovChain {
		const textData = this.textDataRepository.getTextData(lang);
		const chain = new MarkovChain(lang, textData);
		this.chainsMap.set(lang, chain);
		return chain;
	}

	private updateChain(chain: MarkovChain, text: string | string[]) {
		if (!chain) return 0;
		if (typeof text === 'string') {
			chain.updateState(text);
			this.textDataRepository.saveTextData(chain.id, text);
			return 1;
		}
		chain.provideData(text);
		this.textDataRepository.saveTextData(chain.id, text);
		return text.length;
	}

	async updateChainByGuild(guildId: string, text: string | string[]) {
		const chain = await this.getChainForGuild(guildId);
		return this.updateChain(chain, text);
	}

	async updateChainByLang(lang: string, text: string | string[]) {
		const chain = this.getChain(lang);
		return this.updateChain(chain, text);
	}

	async removeData(lang: string, text: string) {
		const chain = this.getChain(lang);
		if (!chain) return 0;
		chain.delete(text);
		this.textDataRepository.deleteTextData(lang, text);
		return 1;
	}

	private loadChains() {
		const load = Logger.loading('Loading Chains...');
		try {
			const storageRefs = this.textDataRepository.getStorageRefs();
			for (const lang of storageRefs) {
				this.createChain(lang);
			}
			load.success(`Loaded ${storageRefs.length} chains`);
			this.chainsMap.forEach((chain) => {
				Logger.info(`Chain '${chain.id}' size: #green${chain.size}$`);
			});
		} catch (error) {
			load.fail('Failed loading chains');
		}
	}
}

import { FileManager } from '../domain/FileManager';
import { USE_THRESHOLD } from '../../static/Static';
import { getRandom, toHieroglyphs } from '../../utils/Utils';
import {
	getUrlDomain,
	getUrlExtension,
	isGifUrl,
	isImageUrl,
	isVideoUrl,
	validateUrl,
} from '../../utils/UrlUtils';
/**
 * `key`: Guild ID
 * `value`: MarkovChain
 */
export const chainsMap = new Map<string, MarkovChain>();

type MarkovState = Record<string, Record<string, number>>;
export type ChainAnalytics = {
	complexityScore: number;
	gifs: number;
	images: number;
	videos: number;
	replyRate: number;
	words: number;
};
export class MarkovChain {
	public state: MarkovState;
	public replyRate: number;
	gifs: Set<string>;
	images: Set<string>;
	videos: Set<string>;

	constructor() {
		this.state = {};
		this.replyRate = 10;
		this.gifs = new Set<string>();
		this.images = new Set<string>();
		this.videos = new Set<string>();
	}

	provideData(messages: string[]): void {
		for (const message of messages) {
			this.updateState(message);
		}
	}

	updateState(message: string): void {
		if (message.startsWith('https:')) {
			const extenstion = getUrlExtension(message);
			const domain = getUrlDomain(message);
			if (isGifUrl(domain, extenstion)) this.gifs.add(message);
			if (isImageUrl(domain, extenstion)) this.images.add(message);
			if (isVideoUrl(domain, extenstion)) this.videos.add(message);
		}

		const words = message.split(' ');

		for (let i = 0; i < words.length - 1; i++) {
			const currentWord = words[i];
			const nextWord = words[i + 1];

			if (!this.state[currentWord]) {
				this.state[currentWord] = {};
			}

			if (!this.state[currentWord][nextWord]) {
				this.state[currentWord][nextWord] = 1;
			} else {
				this.state[currentWord][nextWord]++;
			}
		}
	}

	generateText(startWord: string, length: number): string {
		let currentWord = startWord;
		let generatedText = currentWord;

		for (let i = 0; i < length; i++) {
			const nextWords = this.state[currentWord];
			if (!nextWords) {
				break;
			}

			const nextWordArray = Object.keys(nextWords);
			const nextWordWeights = Object.values(nextWords);

			currentWord = this.weightedRandomChoice(nextWordArray, nextWordWeights);
			generatedText += ' ' + currentWord;
		}

		return generatedText;
	}

	private weightedRandomChoice(options: string[], weights: number[]): string {
		const totalWeight = weights.reduce((a, b) => a + b, 0);
		const randomWeight = Math.random() * totalWeight;
		let weightSum = 0;

		for (let i = 0; i < options.length; i++) {
			weightSum += weights[i];
			if (randomWeight <= weightSum) {
				return options[i];
			}
		}

		return options[options.length - 1];
	}

	getWordsByValue(value: number): string[] {
		const valuedWords: string[] = [];
		const invertedIndex: Record<number, string[]> = {};

		// Build the inverted index
		// O(n)
		for (const currentWord in this.state) {
			const nextWords = this.state[currentWord];
			for (const nextWord in nextWords) {
				const wordValue = nextWords[nextWord];
				if (!invertedIndex[wordValue]) {
					invertedIndex[wordValue] = [];
				}

				invertedIndex[wordValue].push(nextWord);
			}
		}

		// Retrieve words with the specified value from the inverted index
		if (invertedIndex[value]) {
			valuedWords.push(...invertedIndex[value]);
		}

		return valuedWords;
	}

	getWordsHigherThanValue(value: number): string[] {
		const valuedWords: string[] = [];

		for (const currentWord in this.state) {
			const nextWords = this.state[currentWord];
			for (const nextWord in nextWords) {
				const wordValue = nextWords[nextWord];
				if (wordValue > value) {
					valuedWords.push(nextWord);
				}
			}
		}

		return valuedWords;
	}

	getComplexity(): number {
		const stateSize = Object.keys(this.state).length;
		let highValueWords = 0;

		// O(n) not O(n^2)
		for (const nextWords of Object.values(this.state)) {
			for (const wordValue of Object.values(nextWords)) {
				if (wordValue > USE_THRESHOLD) {
					highValueWords++;
				}
			}
		}
		// Calculate the complexity score based on state size and high-value words
		// y = log2(10*x*HVW + 1)
		return Math.ceil(Math.log2(10 * stateSize * highValueWords + 1));
	}

	getAnalytics(): ChainAnalytics {
		return {
			complexityScore: this.getComplexity(),
			gifs: this.gifs.size,
			images: this.images.size,
			videos: this.videos.size,
			replyRate: this.replyRate,
			words: Object.keys(this.state).length,
		} as ChainAnalytics;
	}

	async getGif(): Promise<string> {
		return this.getValidUrl(this.gifs, 'gifs');
	}

	async getImage(): Promise<string> {
		return this.getValidUrl(this.images, 'images');
	}

	async getVideo(): Promise<string> {
		return this.getValidUrl(this.videos, 'videos');
	}

	talk(length: number): string {
		const keys = Object.keys(this.state);
		const randomIndex = Math.floor(Math.random() * keys.length);
		const starterWord = keys[randomIndex];
		const sentence = this.filter(this.generateText(starterWord, length));
		// 0.5% to turn text into hieroglyphs
		return getRandom(1, 200) === 69 ? toHieroglyphs(sentence) : sentence;
	}

	delete(message: string, fileName: string): boolean {
		// Given a message delete it from the markov chain
		if (message.startsWith('https:')) {
			const extenstion = getUrlExtension(message);
			const domain = getUrlDomain(message);
			if (isGifUrl(domain, extenstion)) this.gifs.delete(message);
			if (isImageUrl(domain, extenstion)) this.images.delete(message);
			if (isVideoUrl(domain, extenstion)) this.videos.delete(message);
		}

		const words = message.split(' ');
		for (let i = 0; i < words.length - 1; i++) {
			const currentWord = words[i];
			const nextWord = words[i + 1];
			if (this.state[currentWord]) {
				if (this.state[currentWord][nextWord]) {
					this.state[currentWord][nextWord]--;
				}
			}
		}

		// Also delete it from training data storage
		return FileManager.deleteOccurrences(message, fileName);
	}

	private filter(text: string): string {
		return text.replace(/\\n/g, '').trim();
	}

	private async getValidUrl(urlsSet: Set<string>, type?: string): Promise<string> {
		const urls = Array.from(urlsSet);
		while (urls.length > 0) {
			const randomIndex = Math.floor(Math.random() * urls.length);
			const media = urls[randomIndex];

			if (await validateUrl(media)) {
				return media;
			} // Valid URL

			urlsSet.delete(media); // Remove invalid URL from set
		}

		return `I got no valid ${type ?? 'URLs'} in my brain`;
	}
}

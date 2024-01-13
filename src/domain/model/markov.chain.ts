import { MarkovChainAnalyzer } from './chain.analyzer';
import { MediaStorage } from './media.storage';

export class MarkovChain {
	public mediaStorage: MediaStorage;
	state: MarkovState;
	messageCounter: number;

	constructor(
		public id: string,
		messages: string[] = []
	) {
		this.mediaStorage = new MediaStorage(this.id);
		this.state = {};
		this.messageCounter = 0;
		this.provideData(messages);
	}

	get size() {
		return new MarkovChainAnalyzer(this).size;
	}

	get analytics() {
		return new MarkovChainAnalyzer(this).getAnalytics();
	}

	provideData(messages: string[]): void {
		messages.forEach((message) => this.updateState(message));
	}

	updateState(message: string): void {
		this.messageCounter++;
		if (message.startsWith('https://')) {
			this.mediaStorage.addMedia(message);
			return;
		}
		const words = message.split(' ');

		for (let i = 0; i < words.length - 1; i++) {
			const currentWord = words[i];
			const nextWord = words[i + 1];

			this.state[currentWord] ??= {};
			this.state[currentWord][nextWord] ??= 0;
			this.state[currentWord][nextWord]++;
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

	talk(length: number): string {
		const keys = Object.keys(this.state);
		const randomIndex = Math.floor(Math.random() * keys.length);
		const starterWord = keys[randomIndex];
		return this.generateText(starterWord, length).trim();
	}

	delete(message: string) {
		// Given a message delete it from the markov chain
		if (message.startsWith('https:')) {
			this.mediaStorage.removeMedia(message);
		}

		const words = message.split(' ');
		for (let i = 0; i < words.length - 1; i++) {
			const currentWord = words[i];
			const nextWord = words[i + 1];
			if (this.state[currentWord] && this.state[currentWord][nextWord]) {
				this.state[currentWord][nextWord]--;
			}
		}
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
}

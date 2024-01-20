import { MarkovChainAnalyzer } from './chain.analyzer';
import { MediaStorage } from './media.storage';

export class MarkovChain {
	public mediaStorage: MediaStorage;
	public state: MarkovState;
	public messageCounter: number;

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

	updateState(text: string): void {
		if (text.startsWith('http')) {
			this.mediaStorage.addMedia(text);
			return;
		}
		this.messageCounter++;

		const words = this.tokenize(text);

		for (let i = 0; i < words.length - 2; i++) {
			const currentWord = words[i];
			const nextWord = words[i + 1];
			const nextNextWord = words[i + 2];

			this.state[currentWord] ??= {};
			this.state[currentWord][nextWord] ??= {};
			this.state[currentWord][nextWord][nextNextWord] ??= 0;

			this.state[currentWord][nextWord][nextNextWord]++;
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
			const nextWordWeights = Object.values(nextWords).map((subState) =>
				Object.values(subState).reduce((a, b) => a + b, 0)
			);

			// ? Laplace smoothing
			const smoothedWeights = nextWordWeights.map(
				(weight) => (weight + 1) / (this.messageCounter + nextWordArray.length)
			);

			currentWord = this.stochasticChoice(nextWordArray, smoothedWeights);
			generatedText += ' ' + currentWord;
		}

		return generatedText;
	}

	talk(length: number): string {
		const keys = Object.keys(this.state);
		const randomIndex = Math.floor(Math.random() * keys.length - 1);
		const starterWord = keys[randomIndex];
		return this.generateText(starterWord, length).trim();
	}

	delete(message: string) {
		if (message.startsWith('https://')) {
			this.mediaStorage.removeMedia(message);
		}

		const words = this.tokenize(message);

		for (let i = 0; i < words.length - 2; i++) {
			const currentWord = words[i];
			const nextWord = words[i + 1];
			const nextNextWord = words[i + 2];

			if (
				this.state[currentWord] &&
				this.state[currentWord][nextWord] &&
				this.state[currentWord][nextWord][nextNextWord]
			) {
				this.state[currentWord][nextWord][nextNextWord]--;
			}
		}
	}

	private tokenize(text: string) {
		const cleanText = text.replace(/[^\w\s]/g, '');
		const tokens = cleanText.split(/\s+/);
		return tokens.filter((token) => token.length > 0);
	}

	private stochasticChoice(options: string[], weights: number[]): string {
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

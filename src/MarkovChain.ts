import axios from 'axios';

/**
 * `key`: Guild ID 
 * `value`: new MarkovChain
 */
export const chainsMap = new Map<string, MarkovChain>();

interface MarkovState {
    [key: string]: {
        [key: string]: number;
    };
}

export class MarkovChain {
    public state: MarkovState;
    public replyRate: number;
    gifs: string[];
    images: string[];
    videos: string[];
    constructor() {
        this.state = {};
        this.replyRate = 10
        this.gifs = [];
        this.images = [];
        this.videos = [];
    }

    provideData(messages: string[]): void {
        for (const message of messages) {
            this.updateState(message);
        }
    }

    updateState(message: string): void {
        if (message.startsWith('https:')) {
            if (message.endsWith('.gif'))
                this.gifs.push(message);
            if (message.endsWith('.png') || message.endsWith('.jpeg') || message.endsWith('.jpg'))
                this.images.push(message);
            if (message.endsWith('.mp4') || message.endsWith('.mov'))
                this.videos.push(message);

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
        const invertedIndex: { [value: number]: string[] } = {};

        // Build the inverted index
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
        const USE_THRESHOLD = 15
        const stateSize = Object.keys(this.state).length;
        let highValueWords = 0;

        for (const currentWord in this.state) {
            const nextWords = this.state[currentWord];
            for (const nextWord in nextWords) {
                const wordValue = nextWords[nextWord];
                if (wordValue > USE_THRESHOLD) { // Adjust the threshold for what is considered a "high-value" word
                    highValueWords++;
                }
            }
        }
        // Calculate the complexity score based on state size and high-value words
        const complexityScore = stateSize + highValueWords;

        return complexityScore;

    }

    async getGif(): Promise<string> {
        while (this.gifs.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.gifs.length);
            const gifURL = this.gifs[randomIndex];

            if (await validateURL(gifURL)) {
                return gifURL; // Valid URL
            } else {
                this.gifs.splice(randomIndex, 1); // Remove invalid URL from array
            }
        }

        return "I got no gifs in my brain"; // No valid URLs found
    }

    async getImage(): Promise<string> {
        while (this.images.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.images.length);
            const imageURL = this.images[randomIndex];

            if (await validateURL(imageURL)) {
                return imageURL; // Valid URL
            } else {
                // Remove invalid URL from array and try again1
                this.images.splice(randomIndex, 1);
            }
        }

        return "I got no images in my brain"; // No valid URLs found
    }

    async getVideo(): Promise<string> {
        while (this.videos.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.videos.length);
            const videoURL = this.videos[randomIndex];

            if (await validateURL(videoURL)) {
                return videoURL; // Valid URL
            } else {
                this.videos.splice(randomIndex, 1); // Remove invalid URL from array
            }
        }

        return "I got no videos in my brain"; // No valid URLs found
    }

    talk(length: number): string {
        const keys = Object.keys(this.state);
        const randomIndex = Math.floor(Math.random() * keys.length);
        const starterWord = keys[randomIndex];
        return this.filter(this.generateText(starterWord, length));
    }

    private filter(text: string): string {
        return text.replace(/\\n/g, '').trim();
    }

}


async function validateURL(url: string): Promise<boolean> {
    try {
        const response = await axios.get(url);
        return response.status === 200; // Valid if status code is 200
    } catch (error) {
        return false; // Invalid URL or request error
    }
}

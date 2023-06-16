import { WordTokenizer } from 'natural';

interface MarkovState {
    [key: string]: {
        [key: string]: number;
    };
}

export class MarkovChain {
    public state: MarkovState;
    tokenizer: WordTokenizer;

    constructor() {
        this.state = {};
        this.tokenizer = new WordTokenizer({
            discardEmpty: true,
            pattern: /[\w']+/g
        })
        
    }

    provideData(messages: string[]): void {
        for (const message of messages) {
            this.updateState(message);
        }
    }

    updateState(message: string): void {
        const words = this.tokenizer.tokenize(message) ;
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
}
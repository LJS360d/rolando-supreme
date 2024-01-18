import { franc } from 'franc';

export class LanguageService {
	getLanguage(text: string | string[]) {
		if (typeof text === 'string') {
			return franc(text);
		}

		const languageCounts: { [key: string]: number } = {};

		text.forEach((msg) => {
			const lang = franc(msg);
			languageCounts[lang] = (languageCounts[lang] || 0) + 1;
		});

		const mostFrequentLanguage = Object.keys(languageCounts).reduce((a, b) =>
			languageCounts[a] > languageCounts[b] ? a : b
		);

		return mostFrequentLanguage;
	}
}

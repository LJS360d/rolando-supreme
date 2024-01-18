export enum Language {
	english = 'eng',
	french = 'fra',
	spanish = 'spa',
	german = 'deu',
	italian = 'ita',
}

export const LanguageUndefined = 'und';

export const LanguagesIterator = Object.values(Language);

export type LanguageUnion = keyof typeof Language;

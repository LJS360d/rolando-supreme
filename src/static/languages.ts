export enum Language {
	english = 'eng',
	french = 'fra',
	spanish = 'spa',
	german = 'deu',
	italian = 'ita',
}

export const LanguageUndefined = 'und';

export const LanguagesIterator = Object.values(Language);

export const LanguageKeysIterator = Object.keys(Language);

export type LanguageUnion = keyof typeof Language;

export const isLanguage = (value: string): value is Language =>
	LanguageKeysIterator.includes(value);

export const LanguageChoices: { value: Language; name: LanguageUnion }[] = Object.entries(
	Language
).map(([name, value]) => ({ name: name as LanguageUnion, value }));

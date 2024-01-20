export enum Theme {
	Dark = 'dark',
	Night = 'night',
	Light = 'light',
}

export const ThemesIterator = Object.values(Theme);

export const ThemeKeysIterator = Object.keys(Theme);

export type ThemeUnion = keyof typeof Theme;

export const isTheme = (value: string): value is Theme =>
	ThemeKeysIterator.includes(value);

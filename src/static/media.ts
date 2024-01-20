export enum Media {
	Videos = 'videos',
	Images = 'images',
	Gifs = 'gifs',
}

export const MediaIterator = Object.values(Media);

export const MediaKeysIterator = Object.keys(Media);

export type MediaUnion = keyof typeof Media;

export const isMedia = (value: string): value is Media =>
	MediaKeysIterator.includes(value);

import { isGifUrl, isImageUrl, isVideoUrl, isWorkingUrl } from '../../utils/url.utils';

export class MediaStorage {
	gifs: Set<string>;
	images: Set<string>;
	videos: Set<string>;
	constructor(
		public chainId: string,
		gifs: string[] = [],
		images: string[] = [],
		videos: string[] = []
	) {
		this.gifs = new Set<string>(gifs);
		this.images = new Set<string>(images);
		this.videos = new Set<string>(videos);
	}

	addMedia(url: string) {
		if (isGifUrl(url)) this.gifs.add(url);
		else if (isVideoUrl(url)) this.videos.add(url);
		else if (isImageUrl(url)) this.images.add(url);
		return;
	}

	async getMedia(type: 'gif' | 'video' | 'image'): Promise<string> {
		switch (type) {
			case 'gif':
				return await this.getValidUrl(this.gifs, type);
			case 'video':
				return await this.getValidUrl(this.videos, type);
			case 'image':
				return await this.getValidUrl(this.images, type);
		}
	}

	private async getValidUrl(urlSet: Set<string>, type: string) {
		const urls = Array.from(urlSet);
		while (urls.length > 0) {
			const randomIndex = Math.floor(Math.random() * urls.length);
			const media = urls.at(randomIndex)!;

			if (await isWorkingUrl(media)) {
				// Valid URL
				return media;
			}

			// Remove invalid URL from set
			urlSet.delete(media);
			// TODO also Remove invalid URL from text storage
		}
		return `No valid ${type} found`;
	}

	removeMedia(url: string): void {
		this.gifs.delete(url);
		this.videos.delete(url);
		this.images.delete(url);
	}
}

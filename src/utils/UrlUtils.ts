import axios from 'axios';

export function containsWorkingURL(string: string) {
	const urlRegex = /(https?|ftp):\/\/[^\s/$.?#].[^\s]*/;
	const matches = urlRegex.exec(string);

	if (matches) {
		for (const url of matches) {
			try {
				const { protocol } = new URL(url);
				if (protocol === 'http:' || protocol === 'https:') {
					return true;
				}
			} catch (error) {
				// Ignore invalid URLs
			}
		}
	}

	return false;
}

export function getUrlExtension(url: string) {
	try {
		return new URL(url).pathname.match(/\.[^./?]+(?=\?|$| )/)?.[0];
	} catch (error) {
		// Invalid URL
		return null;
	}
}

export function getUrlDomain(url: string) {
	try {
		return new URL(url).hostname;
	} catch (error) {
		// Invalid URL
		return null;
	}
}

export async function validateUrl(url: string): Promise<boolean> {
	try {
		const response = await axios.head(url);
		return response.status === 200;
	} catch (error) {
		return false;
	}
}

export function isGifUrl(domain: string, extension: string) {
	const supportedExtensions = ['.gif'];
	const supportedDomains = ['tenor.com', 'giphy.com'];
	return supportedExtensions.includes(extension) || supportedDomains.includes(domain);
}

export function isImageUrl(domain: string, extension: string) {
	const supportedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
	const supportedDomains = ['imgur.com'];
	return supportedExtensions.includes(extension) || supportedDomains.includes(domain);
}

export function isVideoUrl(domain: string, extension: string) {
	const supportedExtensions = ['.mp4', '.mov'];
	const supportedDomains = ['www.youtube.com', 'youtu.be'];
	return supportedExtensions.includes(extension) || supportedDomains.includes(domain);
}

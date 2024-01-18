import axios from 'axios';

function extractUrlInfo(url: string): { domain?: string; extension?: string } {
	const extension = getUrlExtension(url);
	const domain = getUrlDomain(url);
	return { domain, extension };
}

export async function extractValidUrls(input: string): Promise<string[]> {
	const urlRegex = /(https?:\/\/[^\s]+)/g;
	const matches = input.match(urlRegex) ?? ({} as RegExpMatchArray);
	const validUrls: string[] = [];
	for (const url of matches) {
		if (await isWorkingUrl(url)) {
			validUrls.push(url);
		}
	}
	return validUrls;
}

export function containsURL(text: string): boolean {
	const urlRegex = /(https?):\/\/[^\s/$.?#].[^\s]*/;
	const matches = urlRegex.exec(text);

	if (matches) {
		for (const url of matches) {
			try {
				const { protocol } = new URL(url);
				if (protocol === 'http:' || protocol === 'https:') {
					return true;
				}
			} catch (error) {
				continue;
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
		return undefined;
	}
}

export function getUrlDomain(url: string) {
	try {
		return new URL(url).hostname;
	} catch (error) {
		// Invalid URL
		return undefined;
	}
}

export async function isWorkingUrl(url: string | null | undefined): Promise<boolean> {
	if (!url) return false;
	try {
		const response = await axios.head(url);
		return response.status < 400;
	} catch (error) {
		return false;
	}
}

export function isGifUrl(url: string) {
	const { domain, extension } = extractUrlInfo(url);
	const supportedExtensions = ['.gif'];
	const supportedDomains = ['tenor.com', 'giphy.com'];
	if (domain && extension)
		return supportedExtensions.includes(extension) || supportedDomains.includes(domain);
	else return false;
}

export function isImageUrl(url: string) {
	const { domain, extension } = extractUrlInfo(url);
	const supportedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
	const supportedDomains = ['imgur.com'];
	if (domain && extension)
		return supportedExtensions.includes(extension) || supportedDomains.includes(domain);
	else return false;
}

export function isVideoUrl(url: string) {
	const { domain, extension } = extractUrlInfo(url);
	const supportedExtensions = ['.mp4', '.mov'];
	const supportedDomains = ['www.youtube.com', 'youtu.be'];
	if (domain && extension)
		return supportedExtensions.includes(extension) || supportedDomains.includes(domain);
	else return false;
}

import axios from 'axios';
import { HieroglyphsMap, InvertedHieroglyphsMap } from '../static/Hieroglyphs';

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

/**
 * The `min` and `max` parameters are inclusive.
 * @param min The minimum number to return.
 * @param max The maximum number to return.
 * @returns A random number between the two numbers.
 */
export function getRandom(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export function toHieroglyphs(str: string): string {
	return str
		.toLowerCase()
		.split('')
		.map((char) => HieroglyphsMap.get(char) ?? char)
		.join('');
}

export function backToAlphabet(str: string): string {
	return str
		.toLowerCase()
		.split('')
		.map((char) => InvertedHieroglyphsMap.get(char) ?? char)
		.join('');
}

export function getUrlExtension(url: string) {
  return url.match(/\.[^./?]+(?=\?|$| )/)?.[0]
}

export function getUrlDomain(url: string) {
  try{
    return new URL(url).hostname
  } catch (error) {
    // Invalid URL
  }
  return null;
}

export async function validateUrl (url: string): Promise<boolean> {
  try {
    const response = await axios.head(url);
    return response.status === 200;
  } catch (error) {
    return false; // Invalid URL or request error
  }
}
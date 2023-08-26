export function containsWorkingURL(string: string) {
    const urlRegex = /(https?|ftp):\/\/[^\s/$.?#].[^\s]*/;
    const matches = string.match(urlRegex);

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
export async function formatMovieNameForId(movieName: string): Promise<string> {
    return movieName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-');
}
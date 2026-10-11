import { formatMovieNameForId } from './formatMovieName';
import { type Page } from '@playwright/test';

export async function pickSession(page: Page, date: string, hourSection: string, movieName: string): Promise<void> {
    await page.getByText(`${date}`).click();
    await page.locator(`#${await formatMovieNameForId(movieName)} a:has-text("${hourSection}")`).click();
}

import { test, expect, type Page } from '@playwright/test';

const data = {
    quantityOfTickets: 3,
    movie: 'A odisseia',
    hourSection: '16:40',
    seats: ['A1', 'A2', 'A3'],
    date: '29/09',
}

const enum theaterLocation {
    RIOMAR = 'cinemark-riomar-recife',
    UCI = 'uci-kinoplex-shopping-recife',
    DELUX = 'uci-kinoplex-recife-delux'
}

const movieSessionDetails = {
    city: 'recife',
    theather: theaterLocation.DELUX
}

const baseUrl = `https://www.ingresso.com/cinema/${movieSessionDetails.theather}?city=${movieSessionDetails.city}`;

async function pickSession(page: Page, date: string, hourSection: string, movieName: string): Promise<void> {
    await page.getByText(`${date}`).click();
    await page.locator(`#a-odisseia a:has-text("${data.hourSection}")`).click();
    await page.waitForTimeout(1000); //mudar depois
}

test('Selection of movie and seats', async ({ page }) => {
    await page.goto(baseUrl);
    await pickSession(page, data.date, data.hourSection, data.movie)
});
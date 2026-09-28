import { test, expect, type Page } from '@playwright/test';

const data = {
    quantityOfTickets: 3,
    movie: 'A odisseia',
    hourSection: '19:00',
    seats: ['A1', 'A2', 'A3'],
    sessionId: '8691409'
}
const theaterLocation = {
    city: 'recife',
    theater: 'uci-kinoplex-recife-delux'
}

const baseUrl = `https://www.ingresso.com/cinema/${theaterLocation.theater}?city=${theaterLocation.city}`;

async function clicarSessaoIMAX(page: Page, sessionId: string): Promise<void> {
    const linkSessao = page.locator(`a[href*="sessionId=${sessionId}"]`);

    await linkSessao.waitFor({ state: 'visible', timeout: 10000 });

    await linkSessao.click();

    console.log(`Sessão IMAX ${sessionId} selecionada`);
}

test('Selection of movie and seats', async ({ page }) => {
    await page.goto(baseUrl);

    await clicarSessaoIMAX(page, data.sessionId);
});
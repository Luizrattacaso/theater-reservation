import { test, expect, type Page } from '@playwright/test';

const data = {
    quantityOfTickets: 3,
    movie: 'Digger',
    hourSection: '14:00',
    specificIndices: [10, 11, 12],
    date: '03/10',
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
    await page.locator(`#digger a:has-text("${hourSection}")`).click();
}

test('Selection of movie and seats', async ({ page }) => {
    await page.goto(baseUrl);
    await pickSession(page, data.date, data.hourSection, data.movie);

    const targetRowIndex = 0; // 0 = Linha Q, 1 = Linha P, etc.
    const row = page.locator('.sc-3912aed0-4.cbUPRA').nth(targetRowIndex);
    
    const seatElements = row.locator('div[status], div[type]');

    for (const index of data.specificIndices) {
        const seat = seatElements.nth(index);
        const classAttr = await seat.getAttribute('class') || '';

        const isDisabled = classAttr.includes('disabled');
        const isOccupied = await seat.locator('[status="Occupied"], .occupied').count() > 0;

        if (!isDisabled && !isOccupied) {
            await seat.click();
        } else {
            throw new Error(`O assento na posição ${index} está desativado ou já ocupado.`);
        }
    }
});
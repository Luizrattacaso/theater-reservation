import { test, expect, type Page } from '@playwright/test';

const data = {
    quantityOfTickets: 3,
    movie: 'Digger',
    hourSection: '14:00',
    row: 'O',
    seats: [10, 11, 12],
    date: '03/10',
}

const enum theaterLocation {
    RIOMAR = 'cinemark-riomar-recife',
    UCI = 'uci-kinoplex-shopping-recife',
    DELUX = 'uci-kinoplex-recife-delux'
}

const movieSessionDetails = {
    city: 'recife',
    theater: theaterLocation.DELUX
}

const baseUrl = `https://www.ingresso.com/cinema/${movieSessionDetails.theater}?city=${movieSessionDetails.city}`;
const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

async function pickSession(page: Page, date: string, hourSection: string, movieName: string): Promise<void> {
    await page.getByText(`${date}`).click();
    await page.locator(`#digger a:has-text("${hourSection}")`).click();
}

test('Selection of movie and seats', async ({ page }) => {
    await page.goto(baseUrl);
    await pickSession(page, data.date, data.hourSection, data.movie);

    const quantityOfRows = await page.locator('.sc-3912aed0-4.cbUPRA').count();
    const bottonRowIndex = rowLetters.indexOf(quantityOfRows);
    const targetAlphabeticalIndex = rowLetters.indexOf(data.row.toUpperCase());
    const targetRowIndex = bottonRowIndex - targetAlphabeticalIndex -1;

    const row = page.locator('.sc-3912aed0-4.cbUPRA').nth(targetRowIndex);
    
    const seatElements = row.locator('div[status], div[type]');

    for (const index of data.seats) {
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
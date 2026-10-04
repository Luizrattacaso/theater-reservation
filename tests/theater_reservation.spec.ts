import { test, expect, type Page } from '@playwright/test';

const data = {
    quantityOfTickets: 3,
    movie: 'Digger',
    hourSection: '13:35',
    row: 'O',
    seats: [10, 11, 12],
    date: '07/10',
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

async function pickSession(page: Page, date: string, hourSection: string, movieName: string): Promise<void> {
    await page.getByText(`${date}`).click();
    await page.locator(`#digger a:has-text("${hourSection}")`).click();
}

test('Selection of movie and seats', async ({ page }) => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await pickSession(page, data.date, data.hourSection, data.movie);

    const seatMapContainer = page.locator('.sc-3912aed0-4.cbUPRA');
    await seatMapContainer.waitFor({ state: 'visible', timeout: 15000 });

    const rowContainer = seatMapContainer.locator('.sc-3912aed0-2.cOVDFC').filter({
        has: page.locator('.sc-3912aed0-10.jbunxn', { hasText: new RegExp(`^${data.row}$`, 'i') })
    });

    const seatElements = rowContainer.locator('div[seatmapsize="large"]:not(:has(> div[disabled], > .disabled))');
    
    for (const index of data.seats) {
        const seat = seatElements.nth(index - 1);
        
        if (!(await seat.isVisible())) {
            throw new Error(`O assento no índice ${index} não foi encontrado na Fila ${data.row}.`);
        }

        const classAttr = await seat.getAttribute('class').catch(() => '') || '';
        const isDisabled = classAttr.includes('disabled');
        
        const isOccupied = classAttr.includes('occupied') || (await seat.locator('[status="Occupied"], .occupied').count() > 0);

        if (!isDisabled && !isOccupied) {
            await seat.click();
            await page.waitForTimeout(3000); 
        } else {
            throw new Error(`O assento na posição ${index} da Fila ${data.row} está desativado ou já ocupado.`);
        }
    }
});
import { test } from '@playwright/test';
import { theaterLocation } from './aux_funtions/theaterLocation';
import { theaterSessionLayout } from './aux_funtions/theaterSessionLayout';
import { pickSession } from './aux_funtions/pickSession';

const data = {
    movie: 'Se Eu Fosse Você 3',
    hourSection: '19:30',
    row: 'E',
    seats: [9,8,10],
    date: '14/10',
}

const movieSessionDetails = {
    city: 'recife',
    theater: theaterLocation.DELUX,
    rowLabel: theaterSessionLayout.rowLabel.IMAX,
}

const baseUrl = `https://www.ingresso.com/cinema/${movieSessionDetails.theater}?city=${movieSessionDetails.city}`;

test('Selection of movie and seats', async ({ page }) => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await pickSession(page, data.date, data.hourSection, data.movie);

    const seatMapContainer = page.locator(theaterSessionLayout.mainContainer);
    await seatMapContainer.waitFor({ state: 'visible', timeout: 15000 });

    const rowContainer = seatMapContainer.locator(theaterSessionLayout.rowContainer).filter({
        has: page.locator(movieSessionDetails.rowLabel, { hasText: new RegExp(`^${data.row}$`, 'i') })
    });

    const seatElements = rowContainer.locator(theaterSessionLayout.seat);
    
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
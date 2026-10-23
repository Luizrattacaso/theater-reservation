import { test, type Page } from '@playwright/test';
import { theaterLocation } from './aux_funtions/theaterLocation';
import { theaterSessionLayout } from './aux_funtions/theaterSessionLayout';
import { pickSession } from './aux_funtions/pickSession';

const data = {
    movie: 'Dentro Da Baleia',
    hourSection: '16:35',
    row: 'E',
    seats: [8],
    date: '28/10',
}

const movieSessionDetails = {
    city: 'recife',
    theater: theaterLocation.DELUX,
    seatSelector: theaterSessionLayout.seat,
}

const baseUrl = `https://www.ingresso.com/cinema/${movieSessionDetails.theater}?city=${movieSessionDetails.city}`;

async function closePublicity(page: Page, timeout = 3000) {
  const button = page.getByText('Fechar publicidade');
  try {
    await button.waitFor({ state: 'visible', timeout });
    await button.click({ force: true });
  } catch {
    console.log('No ads found.');
  }
}

test('Selection of movie and seats', async ({ page }) => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    await closePublicity(page);
    await pickSession(page, data.date, data.hourSection, data.movie);

    const seatMapContainer = page.locator(theaterSessionLayout.mainContainer);
    await seatMapContainer.waitFor({ state: 'visible', timeout: 15000 });

    const rowContainer = seatMapContainer.locator(theaterSessionLayout.rowContainer).filter({
        has: page.locator(theaterSessionLayout.rowLabel, { hasText: new RegExp(`^${data.row}$`, 'i') })
    });

    const physicalSeats = rowContainer
        .locator(theaterSessionLayout.seat)
        .filter({ has: page.locator('[status]') });

    for (const seatNumber of data.seats) {
        const seatCell = physicalSeats.nth(seatNumber - 1);

        if (!(await seatCell.isVisible())) {
            throw new Error(`Seat ${seatNumber} in line ${data.row} not found.`);
        }

        const seatStatusElement = seatCell.locator('[status]').first();
        const statusAttr = (await seatStatusElement.getAttribute('status')) || '';
        const classAttr = (await seatStatusElement.getAttribute('class')) || '';

        const isOccupied = statusAttr.toLowerCase() === 'occupied' || classAttr.includes('occupied');
        const isDisabled = statusAttr.toLowerCase() === 'disabled' || classAttr.includes('disabled');

        if (!isOccupied && !isDisabled) {
            const target = seatCell.locator('div[status], svg, circle').first();
            await target.click({ force: true });
            
            await page.waitForTimeout(1000); 
        } else {
            throw new Error(`Seat ${seatNumber} in line ${data.row} is occupied or disabled.`);
        }
    }
});

import { test, type Page } from '@playwright/test';
import { theaterLocation } from './aux_funtions/theaterLocation';
import { theaterSessionLayout } from './aux_funtions/theaterSessionLayout';
import { pickSession } from './aux_funtions/pickSession';

const data = {
    movie: 'A Bruxa',
    hourSection: '21:00',
    row: 'I',
    seats: [10],
    date: '15/10',
}

const movieSessionDetails = {
    city: 'recife',
    theater: theaterLocation.RIOMAR,
    seatSelector: theaterSessionLayout.seat.Cinemark,
}

const baseUrl = `https://www.ingresso.com/cinema/${movieSessionDetails.theater}?city=${movieSessionDetails.city}`;

async function closePublicity(page: Page, timeout = 3000) {
  const button = page.getByText('Fechar publicidade');
  try {
    await button.waitFor({ state: 'visible', timeout });
    await button.click({ force: true });
  } catch {
    console.log('Nenhuma publicidade detectada.');
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

    const seatElements = rowContainer.locator(movieSessionDetails.seatSelector)
    .filter({ hasNot: page.locator('[disabled], .disabled') });
    
    for (const index of data.seats) {
        const seat = seatElements.nth(index - 1);
        
        if (!(await seat.isVisible())) {
            throw new Error(`O assento no índice ${index} não foi encontrado na Fila ${data.row}.`);
        }

        const classAttr = await seat.getAttribute('class').catch(() => '') || '';
        const statusAttr = await seat.getAttribute('status').catch(() => '') || '';

        const isDisabled = classAttr.includes('disabled') || statusAttr === 'Disabled';
        
        const isOccupied = 
            classAttr.includes('occupied') || 
            statusAttr === 'Occupied' || 
            (await seat.locator('[status="Occupied"], .occupied').count() > 0);

        if (!isDisabled && !isOccupied) {
            const interactor = seat.locator('svg, circle, div').first();
            
            if (await interactor.count() > 0) {
                await interactor.click({ force: true });
            } else {
                await seat.click({ force: true });
            }
            
            await page.waitForTimeout(3000); 
        } else {
            throw new Error(`O assento na posição ${index} da Fila ${data.row} está desativado ou já ocupado.`);
        }
    }
});

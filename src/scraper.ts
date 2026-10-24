import { chromium, type Page } from '@playwright/test';
import { theaterLocation } from '../tests/aux_funtions/theaterLocation';
import { theaterSessionLayout } from '../tests/aux_funtions/theaterSessionLayout';
import { pickSession } from '../tests/aux_funtions/pickSession';

async function closePublicity(page: Page, timeout = 3000) {
  const button = page.getByText('Fechar publicidade');
  try {
    await button.waitFor({ state: 'visible', timeout });
    await button.click({ force: true });
  } catch {
    console.log('No ads found or already closed.');
  }
}

export async function runPlaywrightScript(data: any): Promise<boolean> {
    
    let theaterValue = theaterLocation.RIOMAR;
    if (data.location === 'delux') theaterValue = theaterLocation.DELUX;
    if (data.location === 'uci') theaterValue = theaterLocation.UCI;
    if (data.location === 'cinemark') theaterValue = theaterLocation.RIOMAR;
    
    const movieSessionDetails = {
        city: 'recife',
        theater: theaterValue,
        seatSelector: theaterSessionLayout.seat,
    };
    
    const baseUrl = `https://www.ingresso.com/cinema/${movieSessionDetails.theater}?city=${movieSessionDetails.city}`;

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

        await closePublicity(page);
        
        await pickSession(page, data.date, data.hourSection, data.movie);

        const seatMapContainer = page.locator(theaterSessionLayout.mainContainer);
        await seatMapContainer.waitFor({ state: 'visible', timeout: 15000 });

        const rowContainer = seatMapContainer.locator(theaterSessionLayout.rowContainer).filter({
            has: page.locator(theaterSessionLayout.rowLabel, { hasText: new RegExp(`^${data.row}$`, 'i') })
        });

        const physicalSeats = rowContainer
            .locator(movieSessionDetails.seatSelector)
            .filter({ has: page.locator('[status]') });

        for (const seatNumber of data.seats) {
            const seatCell = physicalSeats.nth(seatNumber - 1);

            if (!(await seatCell.isVisible())) {
                console.log(`Seat ${seatNumber} in row ${data.row} not found.`);
                return false; 
            }

            const seatStatusElement = seatCell.locator('[status]').first();
            const statusAttr = (await seatStatusElement.getAttribute('status')) || '';
            const classAttr = (await seatStatusElement.getAttribute('class')) || '';

            const isOccupied = statusAttr.toLowerCase() === 'occupied' || classAttr.includes('occupied');
            const isDisabled = statusAttr.toLowerCase() === 'disabled' || classAttr.includes('disabled');

            if (!isOccupied && !isDisabled) {
                const target = seatCell.locator('div[status], svg, circle').first();
                await target.click({ force: true });
                await page.locator('button.button-next-footer').click();
                await page.waitForTimeout(1000);
            } else {
                console.log(`Seat ${seatNumber} in row ${data.row} is occupied or disabled.`);
                return false; 
            }
        }
        
        console.log("Seat(s) selected successfully! The browser will remain open for 4 minutes.");
        await page.waitForTimeout(4 * 60 * 1000); 
        
        return true; 

    } catch (error) {
        console.error("Detailed Playwright error:", error);
        return false;
    } finally {
        await browser.close();
    }
}
import { chromium, type Page } from '@playwright/test';
import { theaterLocation } from '../tests/aux_funtions/theaterLocation';
import { theaterSessionLayout } from '../tests/aux_funtions/theaterSessionLayout';
import { pickSession } from '../tests/aux_funtions/pickSession';

async function closePublicity(page: Page) {
    await page.getByText('Fechar publicidade').click({ force: true, timeout: 3000 }).catch(() => console.log('No ads found or already closed.'));
}

export async function runPlaywrightScript(data: any): Promise<boolean> {
    const locationMap: Record<string, string> = {
        delux: theaterLocation.DELUX,
        uci: theaterLocation.UCI,
        cinemark: theaterLocation.RIOMAR
    };
    const theaterValue = locationMap[data.location] || theaterLocation.RIOMAR;
    const baseUrl = `https://www.ingresso.com/cinema/${theaterValue}?city=recife`;

    const browser = await chromium.launch({ headless: false });
    const page = await (await browser.newContext()).newPage(); // used this way to reduce lines

    try {
        await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
        await closePublicity(page);
        await pickSession(page, data.date, data.hourSection, data.movie);

        const seatMapContainer = page.locator(theaterSessionLayout.mainContainer);
        await seatMapContainer.waitFor({ state: 'visible', timeout: 15000 });

        const physicalSeats = seatMapContainer
            .locator(theaterSessionLayout.rowContainer)
            .filter({ has: page.locator(theaterSessionLayout.rowLabel, { hasText: new RegExp(`^${data.row}$`, 'i') }) })
            .locator(theaterSessionLayout.seat)
            .filter({ has: page.locator('[status]') });

        for (const seatNumber of data.seats) {
            const seatCell = physicalSeats.nth(seatNumber - 1);

            if (!(await seatCell.isVisible())) {
                console.log(`Seat ${seatNumber} in row ${data.row} not found.`);
                return false; 
            }

            const statusElement = seatCell.locator('[status]').first();
            const attrs = ((await statusElement.getAttribute('status')) + ' ' + (await statusElement.getAttribute('class'))).toLowerCase();

            if (attrs.includes('occupied') || attrs.includes('disabled')) {
                console.log(`Seat ${seatNumber} in row ${data.row} is occupied or disabled.`);
                return false; 
            }

            await seatCell.locator('div[status], svg, circle').first().click({ force: true });
            
            try {
                await page.locator('button.button-next-footer').click({ timeout: 5000 });
            } catch {
                console.log(`Button blocked. Seat(s) ${seatNumber} probably is stuck in the system. Trying again in 4 min.`);
                return false; 
            }
            
            await page.waitForTimeout(1000);
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
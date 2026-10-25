import { runPlaywrightScript } from './scraper';

export const botState = {
    isRunning: false,
    status: 'Inactive',
    logs: [] as string[]
};

function log(message: string) {
    const time = new Date().toLocaleTimeString();
    botState.logs.push(`[${time}] ${message}`);
    console.log(`[${time}] ${message}`);
}

async function waitWithCancel(minutes: number) {
    const msTotal = minutes * 60 * 1000;
    let msWaited = 0;
    
    while (msWaited < msTotal && botState.isRunning) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        msWaited += 1000;
    }
}

export async function startBotLoop(options: any) {
    if (botState.isRunning) return;

    botState.isRunning = true;
    botState.status = 'Running';
    botState.logs = []; 
    
    const endTime = Date.now() + (options.durationHours || 2) * 60 * 60 * 1000;

    while (botState.isRunning && Date.now() < endTime) {
        log(`Searching: ${options.movie} | Date: ${options.date} | Session: ${options.hourSection} | Seat: ${options.row}${options.seats[0]}`);
        
        const success = await runPlaywrightScript(options);
        
        if (success) {
            botState.status = 'Success! Seat captured.';
            log('SUCCESS! Seat selected. The browser will remain open for 4 minutes.');
            botState.isRunning = false;
            break;
        }

        if (botState.isRunning) {
            log('Seat occupied or error. Closing browser.');
            log('Waiting 4 minutes before the next attempt...');
            await waitWithCancel(4); 
        }
    }

    if (Date.now() >= endTime) {
        botState.status = 'Time expired.';
        log('Time limit reached. Shutting down bot.');
        botState.isRunning = false;
    }
}

export function stopBot() {
    botState.isRunning = false;
    botState.status = 'Cancelled by user.';
    log('Stop command received. Cancelling further attempts.');
}
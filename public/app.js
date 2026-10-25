const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusText = document.getElementById('statusText');
const logsDiv = document.getElementById('logs');
let statusInterval;

async function fetchStatus() {
    const res = await fetch('/api/status');
    const state = await res.json();
    
    statusText.innerText = state.status;
    logsDiv.innerHTML = state.logs.join('<br>');
    logsDiv.scrollTop = logsDiv.scrollHeight; 
    
    startBtn.disabled = state.isRunning;
    stopBtn.disabled = !state.isRunning;

    if (!state.isRunning && statusInterval) {
        clearInterval(statusInterval);
        statusInterval = null;
    }
}

startBtn.addEventListener('click', async () => {
    const movie = document.getElementById('movieName').value;
    const rawDate = document.getElementById('movieDate').value;
    const hourSection = document.getElementById('movieTime').value;
    const location = document.getElementById('movieLocation').value;
    const row = document.getElementById('seatRow').value;
    const seatCol = document.getElementById('seatCol').value;
    const durationHours = parseInt(document.getElementById('timeInput').value);
    const seatsArray = seatCol.split(',')
                              .map(s => parseInt(s.trim()))
                              .filter(s => !isNaN(s));

    if (!movie || !rawDate || !hourSection || !location || !row || seatsArray.length === 0) {
        alert('Please fill in all fields correctly.');
        return;
    }

    // Convert a date in YYYY-MM-DD format to DD/MM
    const dateParts = rawDate.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}`; // DD/MM

    const payload = {
        durationHours,
        movie,
        date: formattedDate,
        hourSection,
        location,
        row: row.toUpperCase(),
        seats: seatsArray
    };
    
    await fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    statusInterval = setInterval(fetchStatus, 1000);
});

stopBtn.addEventListener('click', async () => {
    await fetch('/api/stop', { method: 'POST' });
    fetchStatus();
});
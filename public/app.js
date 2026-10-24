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
    // 1. Captura os valores digitados
    const movie = document.getElementById('movieName').value;
    const rawDate = document.getElementById('movieDate').value;
    const hourSection = document.getElementById('movieTime').value;
    const location = document.getElementById('movieLocation').value;
    const row = document.getElementById('seatRow').value;
    const seatCol = document.getElementById('seatCol').value;
    const durationHours = parseInt(document.getElementById('timeInput').value);

    // Validação básica
    if (!movie || !rawDate || !hourSection || !location || !row || !seatCol) {
        alert('Por favor, preencha todos os campos do formulário.');
        return;
    }

    // 2. Converte a data de YYYY-MM-DD (padrão HTML) para DD/MM (padrão do bot)
    const dateParts = rawDate.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}`; // DD/MM

    // 3. Monta o pacote de dados
    const payload = {
        durationHours,
        movie,
        date: formattedDate,
        hourSection,
        location, // ex: "riomar"
        row: row.toUpperCase(),
        seats: [parseInt(seatCol)]
    };
    
    // 4. Envia para o servidor
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
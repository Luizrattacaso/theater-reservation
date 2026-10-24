import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { startBotLoop, stopBot, botState } from './botManager';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public'))); 

app.post('/api/start', (req, res) => {
    const options = req.body; 
    
    if (botState.isRunning) {
        return res.status(400).json({ message: 'bot is already running' });
    }

    startBotLoop(options);
    res.json({ message: 'bot started' });
});

app.post('/api/stop', (req, res) => {
    stopBot();
    res.json({ message: 'bot stopped' });
});

app.get('/api/status', (req, res) => {
    res.json(botState);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\nServer running! Open your browser at: http://localhost:${PORT}\n`);
});
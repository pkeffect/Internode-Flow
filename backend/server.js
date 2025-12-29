import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadPlugins, getNodeRegistry } from './core/pluginLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000; // Internal port

// CORRECT PATHING for Docker Volumes
const WORKFLOWS_DIR = path.join(process.cwd(), 'workflows');

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

if (!fs.existsSync(WORKFLOWS_DIR)) {
    fs.mkdirSync(WORKFLOWS_DIR, { recursive: true });
}

console.log('Initializing Plugin System...');
loadPlugins();

app.get('/api/node-definitions', (req, res) => res.json(getNodeRegistry()));

app.get('/api/workflows', (req, res) => {
    if (!fs.existsSync(WORKFLOWS_DIR)) return res.json([]);
    const files = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.json'));
    res.json(files.map(f => f.replace('.json', '')));
});

app.get('/api/workflows/:name', (req, res) => {
    const filePath = path.join(WORKFLOWS_DIR, `${req.params.name}.json`);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Not found" });
    res.json(JSON.parse(fs.readFileSync(filePath, 'utf8')));
});

app.post('/api/workflows/:name', (req, res) => {
    const safeName = req.params.name.replace(/[^a-z0-9_\-\s]/gi, '_');
    const filePath = path.join(WORKFLOWS_DIR, `${safeName}.json`);
    const payload = { version: 1.0, timestamp: new Date().toISOString(), ...req.body };
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
    res.json({ success: true, name: safeName });
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
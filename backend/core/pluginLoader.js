import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLUGINS_DIR = path.join(process.cwd(), 'plugins'); // Node plugins
const PYTHON_URL = process.env.PYTHON_SERVICE_URL || 'http://python_backend:8000';

let nodeRegistry = [];

async function loadPlugins() {
    nodeRegistry = []; 

    // 1. Load Local Node.js Plugins
    if (fs.existsSync(PLUGINS_DIR)) {
        const folders = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const folder of folders) {
            const entryPoint = path.join(PLUGINS_DIR, folder, 'index.js');
            if (fs.existsSync(entryPoint)) {
                try {
                    const module = await import(`file://${entryPoint}`);
                    if (module.nodes) {
                        const tagged = module.nodes.map(n => ({ ...n, plugin: folder }));
                        nodeRegistry.push(...tagged);
                    }
                } catch (err) { console.error(`[Node] Error loading ${folder}:`, err); }
            }
        }
    }

    // 2. Load Remote Python Plugins
    try {
        console.log(`[Python] Fetching definitions from ${PYTHON_URL}...`);
        const res = await fetch(`${PYTHON_URL}/definitions`);
        if (res.ok) {
            const pythonNodes = await res.json();
            
            // Convert them into "Executable" JS nodes
            const proxies = pythonNodes.map(def => ({
                ...def,
                // The execute function proxies the data to Python
                execute: async (inputs) => {
                    console.log(`[Proxy] Forwarding to Python: ${def.id}`);
                    const runRes = await fetch(`${PYTHON_URL}/execute`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ node_id: def.id, inputs })
                    });
                    if (!runRes.ok) throw new Error(await runRes.text());
                    const data = await runRes.json();
                    return data.result; // Expecting { result: ... }
                }
            }));

            nodeRegistry.push(...proxies);
            console.log(`[Python] Loaded ${proxies.length} nodes.`);
        } else {
            console.warn(`[Python] Failed to fetch definitions: ${res.status}`);
        }
    } catch (e) {
        console.warn(`[Python] Service not reachable: ${e.message}`);
    }

    return nodeRegistry;
}

function getNodeRegistry() { return nodeRegistry; }

export { loadPlugins, getNodeRegistry };
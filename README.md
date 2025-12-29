# Internode (Flow Editor for OpenWebUI)

**Internode** is a visual, node-based workflow editor designed to build agentic workflows for OpenWebUI. Inspired by ComfyUI, it uses a modular "sidecar" architecture allowing you to mix high-performance Node.js orchestration with powerful Python AI execution.

## 🏗 Architecture

The project runs on **Docker Compose** and consists of three communicating services:

1.  **Frontend (`python-flow-front`)** - **Port 3000**
    *   **Tech:** Svelte 5 + Svelte Flow (XyFlow) built as a static SPA.
    *   **Server:** Python FastAPI (serves the UI and handles static assets).
    *   **Role:** The visual interface where you drag, drop, and connect nodes.

2.  **Backend (`node-flow-back`)** - **Port 4200**
    *   **Tech:** Node.js v22 + Express.
    *   **Role:** The "Manager". It handles API requests, saves workflows to disk (`/workflows`), and manages the plugin registry. It proxies execution requests to the Python worker.

3.  **AI Worker (`python-flow-ai`)** - **Internal Network**
    *   **Tech:** Python 3.11 + FastAPI.
    *   **Role:** The "Worker". It scans local `.py` files for custom node definitions (ComfyUI-style) and executes them when triggered by the Backend.

---

## 🚀 Installation & Quick Start

### Prerequisites
*   **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux).
*   *No local Node.js or Python installation required (everything runs in containers).*

### 1. Setup Project Structure
Ensure your project directory looks like this. If you are missing folders, create them:

```text
/my-flow-app
├── docker-compose.yml
├── workflows/               <-- Saved flows appear here
├── frontend/                <-- Svelte source code
├── backend/                 <-- Node.js source code
│   └── plugins/             <-- Custom JS nodes
└── python_backend/          <-- Python source code
    ├── core/                <-- loader.py
    ├── plugins/             <-- Custom Python (.py) nodes
    ├── main.py
    └── requirements.txt
```

### 2. Start the Application
Open your terminal in the project root and run:

```bash
docker compose up --build
```

*   **First Run:** This will take a few minutes to download images and install dependencies.
*   **Success:** Look for these logs:
    *   `Uvicorn running on http://0.0.0.0:8000` (Frontend & Python Backend)
    *   `Backend running on port 4000` (Node Backend)

### 3. Access the Editor
Open your browser to:
👉 **http://localhost:3000**

---

## 🎮 Usage Guide

### Basic Controls
*   **Add Node:** Double-click anywhere on the canvas or Right-click -> "Add Node".
*   **Context Menu:** Right-click on a Node to **Duplicate** or **Delete** it.
*   **Connections:** Drag from a handle dot to another. Incompatible types (e.g., String to Image) will refuse to connect.
*   **Delete Edge:** Right-click on a wire -> "Disconnect".

### Keyboard Shortcuts
| Key Combo | Action |
| :--- | :--- |
| `Ctrl + S` | **Save** current workflow |
| `Ctrl + O` | **Open** load dialog |
| `Ctrl + D` | **Duplicate** selected node |
| `Backspace` / `Del` | **Delete** selected node/edge |
| `Space` | **Fit View** to all nodes |

### Saving & Loading
*   **Save:** Click **File > Save**. Your workflow is saved as a JSON file in the local `./workflows` folder on your computer.
*   **Load:** Click **File > Open**. It lists files found in `./workflows`.
*   **Export API:** Click **File > Export API JSON**. This downloads a stripped-down JSON suitable for sending to an execution engine (like OpenWebUI) without the UI metadata.

---

## 🧩 Adding Custom Nodes

Internode supports both JavaScript (Node.js) and Python nodes.

### Option A: Python Nodes (Recommended for AI/Logic)
Drop any `.py` file into `python_backend/plugins/`. It follows the **ComfyUI Node Standard**.

**Example:** `python_backend/plugins/my_math.py`
```python
class MyMathNode:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "a": ("INT", {"default": 10}),
                "b": ("INT", {"default": 20})
            }
        }
    RETURN_TYPES = ("INT",)
    FUNCTION = "add"
    CATEGORY = "Custom/Math"

    def add(self, a, b):
        return (a + b,)

NODE_CLASS_MAPPINGS = { "MyMathNode": MyMathNode }
```
*Restart the container (`docker compose restart python_backend`) to load new nodes.*

### Option B: JavaScript Nodes (Recommended for Config/IO)
Create a folder in `backend/plugins/` (e.g., `backend/plugins/my_nodes/index.js`).

**Example:** `backend/plugins/my_nodes/index.js`
```javascript
export const nodes = [
  {
    id: "JS.Log",
    label: "Console Log",
    category: "Utils",
    inputs: [{ name: "message", type: "string" }],
    outputs: [],
    execute: (inputs) => {
        console.log(inputs.message);
        return {};
    }
  }
];
```
*Restart the container (`docker compose restart backend`) to load new nodes.*

---

## 🛠️ Troubleshooting

### 1. "Network: use --host to expose"
If you see this in the logs, a service is listening on `127.0.0.1`.
*   **Fix:** Ensure your Dockerfile or `command` in `docker-compose.yml` uses `0.0.0.0`.
*   *Note: The current setup uses `uvicorn ... --host 0.0.0.0`, which handles this automatically.*

### 2. "ERR_MODULE_NOT_FOUND" (Node.js)
*   **Cause:** You might be trying to import `fetch` in Node 22 (where it is built-in) or importing a missing package.
*   **Fix:** Remove `import fetch from 'node-fetch'` lines. If a package is missing, delete `node_modules` volume: `docker compose down -v` and rebuild.

### 3. Changes not showing up?
*   **Frontend UI:** Because we are serving via Python (Static Build), changing a `.svelte` file **requires a rebuild**.
    *   Run: `docker compose up --build frontend`
*   **Backend Logic:** Node.js runs in `--watch` mode. Changes to `server.js` apply instantly.
*   **Python Logic:** Changes to `main.py` or plugins usually require a restart: `docker compose restart python_backend`.

### 4. 404 Error on Save
*   **Cause:** The backend isn't mounted correctly.
*   **Fix:** Ensure your `docker-compose.yml` has `- ./workflows:/app/workflows` under the backend service.

---

## 📜 License
[MIT](LICENSE)
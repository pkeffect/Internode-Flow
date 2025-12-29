from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from core.loader import load_plugins, get_node_definitions, execute_node

app = FastAPI()

# Load plugins on startup
PLUGINS_DIR = "/app/plugins"
load_plugins(PLUGINS_DIR)

class ExecuteRequest(BaseModel):
    node_id: str
    inputs: dict

@app.get("/")
def health():
    return {"status": "ok"}

@app.get("/definitions")
def get_definitions():
    return get_node_definitions()

@app.post("/execute")
def run_node(req: ExecuteRequest):
    try:
        print(f"Executing {req.node_id} with {req.inputs}")
        result = execute_node(req.node_id, req.inputs)
        if isinstance(result, tuple):
            result = result[0]
        return {"result": result}
    except Exception as e:
        print(f"Execution Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
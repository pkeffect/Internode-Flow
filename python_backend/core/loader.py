import os
import importlib.util
import sys

NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}

def load_plugins(plugins_dir):
    global NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS
    if not os.path.exists(plugins_dir):
        os.makedirs(plugins_dir)
        return

    for item in os.listdir(plugins_dir):
        path = os.path.join(plugins_dir, item)
        if item.endswith(".py"):
            load_module(path)

def load_module(path):
    spec = importlib.util.spec_from_file_location("dynamic_plugin", path)
    module = importlib.util.module_from_spec(spec)
    sys.modules["dynamic_plugin"] = module
    try:
        spec.loader.exec_module(module)
        if hasattr(module, "NODE_CLASS_MAPPINGS"):
            NODE_CLASS_MAPPINGS.update(module.NODE_CLASS_MAPPINGS)
        if hasattr(module, "NODE_DISPLAY_NAME_MAPPINGS"):
            NODE_DISPLAY_NAME_MAPPINGS.update(module.NODE_DISPLAY_NAME_MAPPINGS)
        print(f"[{'Python'}] Loaded plugin: {os.path.basename(path)}")
    except Exception as e:
        print(f"[{'Python'}] Error loading {path}: {e}")

def get_node_definitions():
    definitions = []
    for node_id, cls in NODE_CLASS_MAPPINGS.items():
        try:
            input_config = cls.INPUT_TYPES()
            inputs = []
            for name, config in input_config.get("required", {}).items():
                inputType = "string"
                if isinstance(config[0], list): inputType = "string"
                elif config[0] == "INT": inputType = "number"
                elif config[0] == "FLOAT": inputType = "number"
                inputs.append({"name": name, "type": inputType, "label": name})
            
            definitions.append({
                "id": node_id,
                "label": NODE_DISPLAY_NAME_MAPPINGS.get(node_id, node_id),
                "category": getattr(cls, "CATEGORY", "Python/Custom"),
                "plugin": "python",
                "inputs": inputs,
                "outputs": [{"name": "output", "type": "any", "label": "Output"}]
            })
        except Exception as e:
            print(f"Error parsing node {node_id}: {e}")
    return definitions

def execute_node(node_id, inputs):
    if node_id not in NODE_CLASS_MAPPINGS:
        raise ValueError(f"Node {node_id} not found")
    cls = NODE_CLASS_MAPPINGS[node_id]
    instance = cls()
    func_name = getattr(cls, "FUNCTION", "execute")
    func = getattr(instance, func_name)
    return func(**inputs)
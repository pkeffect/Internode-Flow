/**
 * Converts Svelte Flow UI State -> ComfyUI-style API JSON
 * 
 * Structure:
 * {
 *   "NodeID": {
 *     "class_type": "Agent.LLM",
 *     "inputs": {
 *       "prompt": "Hello",
 *       "model": ["OtherNodeID", 0] 
 *     }
 *   }
 * }
 */
export function generateApiJson(nodes, edges) {
    const apiGraph = {};

    // 1. Create lookup for connections
    // TargetNodeID -> { TargetInputName: [SourceNodeID, SourceOutputIndex/Name] }
    const inputMap = {};

    edges.forEach(edge => {
        if (!inputMap[edge.target]) inputMap[edge.target] = {};
        
        // Svelte Flow Edges: source, target, sourceHandle, targetHandle
        // We assume sourceHandle is the output name/index
        inputMap[edge.target][edge.targetHandle] = [edge.source, edge.sourceHandle || 0];
    });

    // 2. Build the Node Dictionary
    nodes.forEach(node => {
        const incomingConnections = inputMap[node.id] || {};
        
        // Start with the static values entered in the UI
        const combinedInputs = { ...node.data }; // Copy user inputs (e.g. text fields)

        // Remove UI-only fields that shouldn't go to API (label, etc)
        delete combinedInputs.label;
        delete combinedInputs.category;
        delete combinedInputs.id;

        // Overlay the Connections (Edges override static values)
        Object.keys(incomingConnections).forEach(inputName => {
            combinedInputs[inputName] = incomingConnections[inputName];
        });

        apiGraph[node.id] = {
            class_type: node.data.id || node.type, // The internal ID (e.g. "Agent.LLM")
            _meta: {
                title: node.data.label // Optional metadata
            },
            inputs: combinedInputs
        };
    });

    return apiGraph;
}
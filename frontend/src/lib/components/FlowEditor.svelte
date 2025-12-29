<script>
  import { onMount } from 'svelte';
  import { 
    SvelteFlow, 
    Background, 
    Controls, 
    useSvelteFlow, 
    useNodes, 
    useEdges,
    addEdge,
    reconnectEdge
  } from '@xyflow/svelte';
  
  import Menubar from '$lib/components/layout/Menubar.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import GenericNode from '$lib/components/GenericNode.svelte';
  import NodePicker from '$lib/components/NodePicker.svelte';
  import ContextMenu from '$lib/components/ContextMenu.svelte';
  
  import { generateApiJson } from '$lib/utils/graphConverter';

  const nodeTypes = { 'generic-node': GenericNode };
  const API_URL = 'http://localhost:4200'; 

  // --- STATE ---
  let nodes = $state([]);
  let edges = $state([]);
  
  let definitions = $state([]);
  let workflows = $state([]);
  let currentWorkflowName = $state("untitled");
  
  let sidebarWidth = $state(250);
  let isResizing = $state(false);
  let isLoaded = $state(false);

  // Interaction State
  let pickerOpen = $state(false);
  let pickerPos = $state({x:0, y:0});
  let contextMenu = $state(null);

  // Hooks
  const { screenToFlowPosition, fitView, getViewport } = useSvelteFlow();

  // --- PERSISTENCE ---
  onMount(() => {
    console.log("FlowEditor Mounted"); 
    const savedNodes = localStorage.getItem('autoSave_nodes');
    const savedEdges = localStorage.getItem('autoSave_edges');
    if (savedNodes) nodes = JSON.parse(savedNodes);
    if (savedEdges) edges = JSON.parse(savedEdges);
    isLoaded = true;
    loadDefinitions();
    loadWorkflows();
  });

  $effect(() => {
    if (isLoaded) {
        localStorage.setItem('autoSave_nodes', JSON.stringify(nodes));
        localStorage.setItem('autoSave_edges', JSON.stringify(edges));
    }
  });

  async function loadDefinitions() {
    try {
      const res = await fetch(`${API_URL}/api/node-definitions`);
      if (res.ok) definitions = await res.json();
    } catch(e) { console.error("API Error", e); }
  }

  async function loadWorkflows() {
    try {
        const res = await fetch(`${API_URL}/api/workflows`);
        if(res.ok) workflows = await res.json();
    } catch(e) { console.error("Failed to load workflows"); }
  }

  // --- SAVING ---
  async function saveWorkflow() {
    let name = prompt("Save Workflow As:", currentWorkflowName);
    if (!name) return;

    const cleanNodes = JSON.parse(JSON.stringify(nodes));
    const cleanEdges = JSON.parse(JSON.stringify(edges));
    let viewport = { x: 0, y: 0, zoom: 1 };
    try { viewport = getViewport(); } catch(e) {}

    try {
        await fetch(`${API_URL}/api/workflows/${name}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nodes: cleanNodes, edges: cleanEdges, viewport })
        });
        currentWorkflowName = name;
        alert(`Saved "${name}"`);
        await loadWorkflows(); 
    } catch(e) { alert("Save failed: " + e.message); }
  }

  async function loadWorkflowByName(name) {
    try {
        const res = await fetch(`${API_URL}/api/workflows/${name}`);
        if (!res.ok) throw new Error("Not found");
        const flow = await res.json();
        nodes = flow.nodes || [];
        edges = flow.edges || [];
        currentWorkflowName = name;
    } catch(e) { alert("Load failed"); }
  }

  function exportApi() {
    const apiJson = generateApiJson(JSON.parse(JSON.stringify(nodes)), JSON.parse(JSON.stringify(edges)));
    const blob = new Blob([JSON.stringify(apiJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentWorkflowName}_api.json`;
    a.click();
  }

  // --- GRAPH OPERATIONS ---
  function addNodeToGraph(nodeDef, position = null) {
     if (!position) position = screenToFlowPosition({ x: window.innerWidth/2, y: window.innerHeight/2 });
     nodes = [...nodes, {
        id: crypto.randomUUID(),
        type: 'generic-node',
        position,
        data: { ...nodeDef } 
     }];
     pickerOpen = false;
  }

  function deleteNode(nodeId) {
      nodes = nodes.filter(n => n.id !== nodeId);
      edges = edges.filter(e => e.source !== nodeId && e.target !== nodeId);
  }

  function deleteEdge(edgeId) {
      edges = edges.filter(e => e.id !== edgeId);
  }

  function duplicateNode(nodeId) {
      const original = nodes.find(n => n.id === nodeId);
      if (!original) return;
      nodes = [...nodes, {
          ...original,
          id: crypto.randomUUID(),
          position: { x: original.position.x + 20, y: original.position.y + 20 },
          data: { ...JSON.parse(JSON.stringify(original.data)) },
          selected: true
      }];
  }

  // --- CONNECTION VALIDATION ---
  function isValidConnection(connection) {
      const source = nodes.find(n => n.id === connection.source);
      const target = nodes.find(n => n.id === connection.target);
      
      if(!source || !target) return false;

      // Find the type of the Output Handle
      const outputDef = source.data.outputs?.find(o => o.name === connection.sourceHandle);
      // Find the type of the Input Handle
      const inputDef = target.data.inputs?.find(i => i.name === connection.targetHandle);

      if (!outputDef || !inputDef) return true; // Fallback if meta missing

      // Logic: Types must match, OR one of them must be 'any' or '*'
      const typeMatch = (outputDef.type === inputDef.type) || 
                        (outputDef.type === 'any') || 
                        (inputDef.type === 'any');
                        
      return typeMatch;
  }

  // --- KEYBOARD SHORTCUTS ---
  function handleGlobalKeydown(e) {
      // 1. Save: Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          saveWorkflow();
      }
      // 2. Open: Ctrl+O
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
          e.preventDefault();
          let name = prompt("Enter workflow name to load:");
          if (name) loadWorkflowByName(name);
      }
      // 3. Duplicate: Ctrl+D (for selected nodes)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
          e.preventDefault();
          const selected = nodes.filter(n => n.selected);
          selected.forEach(n => duplicateNode(n.id));
      }
      // 4. Delete: Backspace/Delete (Handled natively by Flow, but good for enforcement)
      // Note: Svelte Flow default behavior handles this well for selected edges/nodes
  }

  // --- EVENTS (Capture Phase) ---

  function handleWrapperContextMenu(event) {
    event.preventDefault();
    const target = event.target;
    
    // Check for Node
    const nodeElement = target.closest('.svelte-flow__node');
    if (nodeElement) {
        const nodeId = nodeElement.getAttribute('data-id');
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
             contextMenu = {
                type: 'node',
                x: event.clientX,
                y: event.clientY,
                data: node,
                items: [
                    { id: 'duplicate', label: 'Duplicate Node', shortcut: 'Ctrl+D' },
                    'divider',
                    { id: 'delete', label: 'Delete', shortcut: 'Del' }
                ]
            };
        }
        return;
    }

    // Check for Edge
    const edgeElement = target.closest('.svelte-flow__edge');
    if (edgeElement) {
        // Edge ID is usually stored on the group or path
        const edgeId = edgeElement.getAttribute('data-id');
        if (edgeId) {
             contextMenu = {
                type: 'edge',
                x: event.clientX,
                y: event.clientY,
                data: { id: edgeId },
                items: [
                    { id: 'delete_edge', label: 'Disconnect (Delete)', shortcut: 'Del' }
                ]
            };
        }
        return;
    }

    // Default: Canvas Menu
    contextMenu = {
        type: 'canvas',
        x: event.clientX,
        y: event.clientY,
        items: [
            { id: 'add_node', label: 'Add Node', shortcut: 'DblClick' },
            { id: 'fit_view', label: 'Fit View', shortcut: 'Space' },
            'divider',
            { id: 'save', label: 'Save', shortcut: 'Ctrl+S' }
        ]
    };
    pickerOpen = false;
  }

  function handleWrapperDoubleClick(event) {
    if (event.target.closest('.svelte-flow__node')) return;
    if (event.target.closest('.svelte-flow__edge')) return;

    pickerPos = { x: event.clientX, y: event.clientY };
    pickerOpen = true;
    contextMenu = null;
  }

  function onContextSelect(event) {
    const action = event.detail;
    
    // Canvas Actions
    if (contextMenu.type === 'canvas') {
        if (action === 'add_node') {
            pickerPos = { x: contextMenu.x, y: contextMenu.y };
            pickerOpen = true;
        }
        if (action === 'fit_view') fitView();
        if (action === 'save') saveWorkflow();
    }
    
    // Node Actions
    if (contextMenu.type === 'node') {
        const nodeId = contextMenu.data.id;
        if (action === 'delete') deleteNode(nodeId);
        if (action === 'duplicate') duplicateNode(nodeId);
    }

    // Edge Actions
    if (contextMenu.type === 'edge') {
        const edgeId = contextMenu.data.id;
        if (action === 'delete_edge') deleteEdge(edgeId);
    }

    contextMenu = null;
  }

  function handleMenuAction(event) {
    const action = event.detail;
    if (action === 'save') saveWorkflow();
    if (action === 'open') {
        let name = prompt("Enter workflow name to load:");
        if (name) loadWorkflowByName(name);
    }
    if (action === 'export-api') exportApi();
    if (action === 'fitView') fitView();
    if (action === 'new') { if(confirm("Clear flow?")) { nodes=[]; edges=[]; currentWorkflowName="untitled"; } }
  }

  function startResize() { isResizing = true; document.body.style.cursor = 'col-resize'; }
  function stopResize() { if(isResizing) { isResizing = false; document.body.style.cursor = ''; } }
  function handleResize(e) { if(isResizing && e.clientX > 150 && e.clientX < 600) sidebarWidth = e.clientX; }
</script>

<!-- Global Listeners -->
<svelte:window 
    onmousemove={handleResize} 
    onmouseup={stopResize} 
    onkeydown={handleGlobalKeydown} 
/>

<div class="app-structure">
    <Menubar on:action={handleMenuAction} />

    <div class="app-wrapper">
        <div style="width: {sidebarWidth}px; flex-shrink: 0; display: flex;">
            <Sidebar 
                definitions={definitions} 
                workflows={workflows}
                on:addNode={(e) => addNodeToGraph(e.detail)} 
                on:loadWorkflow={(e) => loadWorkflowByName(e.detail)}
            />
        </div>
        
        <div class="resizer" class:active={isResizing} onmousedown={startResize} role="separator" tabindex="0"></div>

        <div 
            class="main-content" 
            role="application"
            oncontextmenucapture={handleWrapperContextMenu}
            ondblclickcapture={handleWrapperDoubleClick}
        >
            <SvelteFlow 
                bind:nodes 
                bind:edges 
                {nodeTypes}
                {isValidConnection}
                fitView
                zoomOnDoubleClick={false} 
                style="background-color: #1e1e1e;"
            >
                <Background color="#555" gap={20} />
                <Controls />
            </SvelteFlow>
        </div>
    </div>
    <Footer />
</div>

{#if contextMenu}
    <div class="overlay-menu">
        <ContextMenu 
            x={contextMenu.x} 
            y={contextMenu.y} 
            items={contextMenu.items}
            on:select={onContextSelect}
            on:close={() => contextMenu = null}
        />
    </div>
{/if}

{#if pickerOpen}
    <div class="overlay-menu">
        <NodePicker 
            x={pickerPos.x} 
            y={pickerPos.y} 
            definitions={definitions} 
            on:add={(e) => addNodeToGraph(e.detail.nodeDef, e.detail)} 
            on:close={() => pickerOpen=false} 
        />
    </div>
{/if}

<style>
    .app-structure { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
    .app-wrapper { display: flex; flex-grow: 1; overflow: hidden; }
    .main-content { flex-grow: 1; height: 100%; position: relative; }

    .overlay-menu {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        z-index: 99999; pointer-events: none;
    }
    .overlay-menu > * { pointer-events: auto; }

    /* Dark Mode Overrides */
    :global(.svelte-flow__controls) { box-shadow: 0 0 5px rgba(0,0,0,0.5); border: 1px solid #444; }
    :global(.svelte-flow__controls-button) { background-color: #2a2d2e !important; border-bottom: 1px solid #444 !important; fill: #e0e0e0 !important; }
    :global(.svelte-flow__controls-button:hover) { background-color: #444 !important; }
    :global(.svelte-flow__controls-button svg) { fill: #e0e0e0 !important; }
    :global(.svelte-flow__attribution) { display: none; }
    
    /* Highlight incompatible connections */
    :global(.svelte-flow__connection-path) { stroke: #999; }
</style>
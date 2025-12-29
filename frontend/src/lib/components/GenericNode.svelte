<script>
  import { Handle, Position } from '@xyflow/svelte';
  
  // Props passed by Svelte Flow automatically
  export let data; 
  // data contains: { label, inputs: [], outputs: [], values: {} }
  
  // Helper to calculate handle positioning/spacing
  const baseHeight = 40;
  const rowHeight = 24;
</script>

<div class="comfy-node">
  <div class="node-header">
    <span class="node-title">{data.label}</span>
    <span class="node-id">{data.id}</span>
  </div>

  <div class="node-body">
    <!-- INPUTS (Left Side) -->
    <div class="inputs-column">
      {#if data.inputs}
        {#each data.inputs as input, i}
          <div class="io-row" style="height: {rowHeight}px;">
            <Handle 
              type="target" 
              position={Position.Left} 
              id={input.name} 
              class="custom-handle"
              style="top: auto; position: relative; transform: none; left: -10px;"
            />
            <span class="io-label">{input.label || input.name}</span>
          </div>
        {/each}
      {/if}
    </div>

    <!-- OUTPUTS (Right Side) -->
    <div class="outputs-column">
      {#if data.outputs}
        {#each data.outputs as output, i}
          <div class="io-row" style="justify-content: flex-end; height: {rowHeight}px;">
            <span class="io-label">{output.label || output.name}</span>
            <Handle 
              type="source" 
              position={Position.Right} 
              id={output.name} 
              class="custom-handle"
              style="top: auto; position: relative; transform: none; right: -10px;"
            />
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .comfy-node {
    background: #222;
    color: #fff;
    border: 1px solid #444;
    border-radius: 4px;
    min-width: 150px;
    font-family: sans-serif;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  }
  .node-header {
    background: #333;
    padding: 5px 10px;
    border-bottom: 1px solid #555;
    border-radius: 4px 4px 0 0;
    display: flex;
    justify-content: space-between;
  }
  .node-title { font-weight: bold; font-size: 14px; }
  .node-id { font-size: 10px; color: #888; }
  
  .node-body {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
  }
  
  .io-row {
    display: flex;
    align-items: center;
    padding: 0 10px;
    position: relative;
  }
  .io-label { font-size: 12px; color: #ccc; margin: 0 5px; }

  /* Override Svelte Flow Handle Styles */
  :global(.custom-handle) {
    width: 10px !important;
    height: 10px !important;
    background: #777 !important;
    border: none !important;
  }
  :global(.custom-handle:hover) { background: #fff !important; }
</style>
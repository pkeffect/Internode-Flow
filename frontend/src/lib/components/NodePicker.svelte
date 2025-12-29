<script>
  import { createEventDispatcher } from 'svelte';
  
  let { x, y, definitions = [] } = $props();
  
  const dispatch = createEventDispatcher();
  let search = $state("");

  let filtered = $derived(definitions.filter(d => 
    (d.label || "").toLowerCase().includes(search.toLowerCase()) || 
    (d.category || "").toLowerCase().includes(search.toLowerCase())
  ));

  function select(nodeDef) {
    dispatch('add', { nodeDef, x, y });
  }
  
  function close() {
    dispatch('close');
  }

  function onBackdropClick(e) {
      if (e.target === e.currentTarget) close();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="backdrop" onclick={onBackdropClick}>
    <div class="menu" style="top: {y}px; left: {x}px;">
        <!-- svelte-ignore a11y_autofocus -->
        <input 
            type="text" 
            bind:value={search} 
            placeholder="Search nodes..." 
            autofocus 
        />
        <div class="list">
            {#each filtered as def}
                <button onclick={() => select(def)}>
                    <span class="cat">{def.category}</span>
                    <span class="name">{def.label}</span>
                </button>
            {/each}
        </div>
    </div>
</div>

<style>
    .backdrop { position: fixed; inset: 0; z-index: 99999; }
    .menu {
        position: absolute;
        width: 200px;
        background: #1e1e1e;
        border: 1px solid #444;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        color: white;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        pointer-events: auto;
    }
    input {
        background: #2a2a2a;
        border: none;
        border-bottom: 1px solid #444;
        color: white;
        padding: 8px;
        outline: none;
    }
    .list { max-height: 200px; overflow-y: auto; }
    button {
        display: flex;
        justify-content: space-between;
        width: 100%;
        background: transparent;
        border: none;
        color: #ddd;
        padding: 6px 10px;
        cursor: pointer;
        text-align: left;
    }
    button:hover { background: #333; }
    .cat { font-size: 0.7em; color: #777; margin-right: 5px; }
</style>
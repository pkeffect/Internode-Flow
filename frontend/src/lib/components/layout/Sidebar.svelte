<script>
    import { createEventDispatcher } from 'svelte';
    
    // FIX: Use $props() for Svelte 5 compatibility
    let { definitions = [], workflows = [] } = $props();
    
    const dispatch = createEventDispatcher();
    
    let activeTab = $state('nodes'); 
    let search = $state("");
    
    // Track collapsed state for groups
    let collapsedGroups = $state(new Set());

    function toggleGroup(groupName) {
        if (collapsedGroups.has(groupName)) {
            collapsedGroups.delete(groupName);
        } else {
            collapsedGroups.add(groupName);
        }
        // Trigger reactivity
        collapsedGroups = new Set(collapsedGroups);
    }

    // Group definitions by Plugin Name
    let groupedNodes = $derived(definitions.reduce((acc, node) => {
        const group = node.plugin || 'Uncategorized';
        if (!acc[group]) acc[group] = [];
        if ((node.label || "").toLowerCase().includes(search.toLowerCase()) || 
            (node.category || "").toLowerCase().includes(search.toLowerCase())) {
            acc[group].push(node);
        }
        return acc;
    }, {}));

    // Sort groups
    let sortedGroups = $derived(Object.keys(groupedNodes).sort((a, b) => {
        if(a === 'core' || a === 'standard') return -1;
        if(b === 'core' || b === 'standard') return 1;
        return a.localeCompare(b);
    }));

    let filteredWorkflows = $derived(workflows.filter(w => w.toLowerCase().includes(search.toLowerCase())));
</script>

<div class="sidebar">
    <!-- TABS -->
    <div class="sidebar-tabs">
        <button 
            class:active={activeTab === 'nodes'} 
            onclick={() => activeTab = 'nodes'}>
            Node Library
        </button>
        <button 
            class:active={activeTab === 'flows'} 
            onclick={() => activeTab = 'flows'}>
            Workflows
        </button>
    </div>

    <!-- SEARCH -->
    <div style="padding: 10px;">
        <input 
            type="text" 
            bind:value={search} 
            placeholder={activeTab === 'nodes' ? "Search nodes..." : "Search workflows..."} 
            class="sidebar-search"
        />
    </div>

    <!-- CONTENT: NODES -->
    {#if activeTab === 'nodes'}
        <div class="sidebar-list">
            {#each sortedGroups as group}
                {#if groupedNodes[group].length > 0}
                    <!-- Collapsible Group Header -->
                    <button class="group-header" onclick={() => toggleGroup(group)}>
                        <span class="arrow">{collapsedGroups.has(group) ? '▶' : '▼'}</span>
                        <span class="group-name">{group.toUpperCase()}</span>
                    </button>
                    
                    <!-- Nodes in Group (Only show if not collapsed) -->
                    {#if !collapsedGroups.has(group)}
                        <div class="group-content">
                            {#each groupedNodes[group] as def}
                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                <div 
                                    class="sidebar-item" 
                                    onclick={() => dispatch('addNode', def)}
                                >
                                    <span class="cat-tag">{def.category}</span>
                                    <span class="node-label">{def.label}</span>
                                </div>
                            {/each}
                        </div>
                    {/if}
                {/if}
            {/each}
        </div>
    {/if}

    <!-- CONTENT: WORKFLOWS -->
    {#if activeTab === 'flows'}
        <div class="sidebar-list">
            {#each filteredWorkflows as flowName}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div 
                    class="sidebar-item workflow-item" 
                    onclick={() => dispatch('loadWorkflow', flowName)}
                >
                    <span class="file-icon">📄</span>
                    <span class="node-label">{flowName}</span>
                </div>
            {/each}
            {#if filteredWorkflows.length === 0}
                <div style="padding: 15px; color: #666; font-size: 12px; text-align: center;">
                    No workflows saved.
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .sidebar { width: 100%; height: 100%; display: flex; flex-direction: column; background: #2a2d2e; border-right: 1px solid #444; }
    
    .sidebar-tabs { display: flex; border-bottom: 1px solid #444; }
    .sidebar-tabs button {
        flex: 1; background: transparent; border: none; color: #888; padding: 10px; cursor: pointer; font-weight: 600; font-size: 12px; border-bottom: 2px solid transparent;
    }
    .sidebar-tabs button:hover { color: #ccc; }
    .sidebar-tabs button.active { color: #fff; border-bottom: 2px solid #4daafc; background: #333; }

    .sidebar-search { width: 100%; background: #1a1a1a; border: 1px solid #444; color: #eee; padding: 6px; border-radius: 4px; box-sizing: border-box; }
    .sidebar-list { flex-grow: 1; overflow-y: auto; }

    /* Group Header Styles */
    .group-header { 
        width: 100%; text-align: left; background: #222; border: none; border-top: 1px solid #444; border-bottom: 1px solid #444;
        padding: 6px 10px; cursor: pointer; display: flex; align-items: center; color: #bbb;
    }
    .group-header:hover { background: #2a2a2a; color: #fff; }
    .group-name { font-size: 10px; font-weight: bold; letter-spacing: 1px; }
    .arrow { font-size: 10px; width: 15px; display: inline-block; }
    .group-content { background: #26292a; }

    .sidebar-item { padding: 8px 12px; cursor: pointer; display: flex; align-items: center; border-bottom: 1px solid #333; transition: background 0.1s; }
    .sidebar-item:hover { background-color: #3c3c3c; }

    .cat-tag { font-size: 9px; text-transform: uppercase; background: #444; color: #aaa; padding: 2px 5px; border-radius: 3px; margin-right: 8px; min-width: 40px; text-align: center; }
    .node-label { font-size: 13px; color: #e0e0e0; }
    
    .workflow-item .file-icon { margin-right: 8px; font-size: 14px; }
</style>
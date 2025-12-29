<script>
    import { createEventDispatcher } from 'svelte';
    
    // Svelte 5 Props Definition
    let { x, y, items = [] } = $props();
    
    const dispatch = createEventDispatcher();

    function handleAction(action) {
        dispatch('select', action);
    }

    function close() {
        dispatch('close');
    }

    // Explicit backdrop handlers
    function onBackdropClick(e) {
        if (e.target === e.currentTarget) close();
    }
    
    function onBackdropContext(e) {
        e.preventDefault();
        if (e.target === e.currentTarget) close();
    }
</script>

<!-- 
    Backdrop: Covers entire screen, captures clicks to close menu.
    Role 'dialog' ensures it sits on top in accessibility tree.
-->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div 
    class="backdrop" 
    onclick={onBackdropClick} 
    oncontextmenu={onBackdropContext}
    role="dialog"
>
    <div class="context-menu" style="top: {y}px; left: {x}px;">
        {#each items as item}
            {#if item === 'divider'}
                <div class="divider"></div>
            {:else}
                <button class="menu-item" onclick={() => handleAction(item.id)}>
                    <span class="label">{item.label}</span>
                    {#if item.shortcut}<span class="shortcut">{item.shortcut}</span>{/if}
                </button>
            {/if}
        {/each}
    </div>
</div>

<style>
    .backdrop { 
        position: fixed; 
        inset: 0; 
        z-index: 99999; /* Very high z-index */
        /* No background color, but it grabs clicks */
    }
    .context-menu {
        position: absolute;
        background: #2a2d2e;
        border: 1px solid #444;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        border-radius: 4px;
        min-width: 160px;
        padding: 4px 0;
        display: flex;
        flex-direction: column;
        pointer-events: auto; /* Ensure menu catches clicks */
    }
    .menu-item {
        background: transparent; border: none; color: #e0e0e0;
        padding: 6px 12px; text-align: left; cursor: pointer;
        display: flex; justify-content: space-between; font-size: 13px;
    }
    .menu-item:hover { background: #556677; color: white; }
    .divider { height: 1px; background: #444; margin: 4px 0; }
    .shortcut { color: #888; font-size: 10px; margin-left: 10px; }
</style>
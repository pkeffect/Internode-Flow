<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
</script>

<nav class="top-menubar bar">
    <ul>
        <li>
            <span>File</span>
            <ul class="dropdown-menu">
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <li onclick={() => dispatch('action', 'new')}><span>New Flow</span></li>
                <li onclick={() => dispatch('action', 'open')}><span>Open...</span></li>
                <li onclick={() => dispatch('action', 'save')}><span>Save</span></li>
                <hr style="border: 0; border-top: 1px solid #444; margin: 5px 0;">
                <li onclick={() => dispatch('action', 'export-api')}><span>Export API JSON</span></li>
            </ul>
        </li>
        <li>
            <span>Edit</span>
            <ul class="dropdown-menu">
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <li onclick={() => dispatch('action', 'undo')}><span>Undo</span></li>
                <li onclick={() => dispatch('action', 'redo')}><span>Redo</span></li>
            </ul>
        </li>
        <li>
            <span>View</span>
            <ul class="dropdown-menu">
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <li onclick={() => dispatch('action', 'fitView')}><span>Fit View</span></li>
            </ul>
        </li>
        
        <li class="menubar-title" style="margin-left: auto;">Agent Flow Studio</li>
    </ul>
</nav>
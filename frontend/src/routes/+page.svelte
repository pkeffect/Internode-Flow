<script>
  import { SvelteFlowProvider } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import FlowEditor from '$lib/components/FlowEditor.svelte';
</script>

<div style="height: 100vh; width: 100%;">
  <!-- The Provider MUST wrap the component that uses useSvelteFlow() -->
  <SvelteFlowProvider>
    <FlowEditor />
  </SvelteFlowProvider>
</div>
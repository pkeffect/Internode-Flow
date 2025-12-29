import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		// THIS IS THE CRITICAL PART
		host: '0.0.0.0', 
		port: 5173,
		// Fixes hot reload in Docker
		watch: {
			usePolling: true
		}
	}
});
import { defineConfig } from 'vite';

// Opt-in: public/demo deployments never pretend a disconnected API is available.
const api = process.env.LOCAL_REQUEST_API === '1' ? {
  '/api': { target: 'http://127.0.0.1:8787', changeOrigin: false }
} : undefined;
export default defineConfig({ server: { proxy: api, ...(api && { host: '127.0.0.1' }) }, preview: { proxy: api, ...(api && { host: '127.0.0.1' }) } });

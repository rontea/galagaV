import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // CHANGE PORT HERE
    port: 5173, 
    // Set to true to expose to your local network (e.g. access via phone)
    host: true, 
  }
});
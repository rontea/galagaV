import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Custom middleware to handle System Halt and Disk Operations
const galagaSystemPlugin = () => ({
  name: 'galaga-system',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      // 1. ENDPOINT: LIST PLUGINS (Scan Disk)
      if (req.url?.startsWith('/__system/list-plugins')) {
        const pluginsDir = path.resolve('plugins');
        const foundIds: string[] = [];

        if (fs.existsSync(pluginsDir)) {
          try {
            const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
            for (const entry of entries) {
              if (entry.isDirectory()) {
                const manifestPath = path.join(pluginsDir, entry.name, 'public', 'manifest.json');
                if (fs.existsSync(manifestPath)) {
                  try {
                    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
                    const manifest = JSON.parse(manifestContent);
                    if (manifest.id) foundIds.push(manifest.id);
                  } catch (e) {
                    // Ignore malformed manifests
                  }
                }
              }
            }
          } catch (e) {
            console.error("Error scanning plugins:", e);
          }
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(foundIds));
        return;
      }

      // 2. ENDPOINT: DESTROY PLUGIN (Delete Disk)
      if (req.url?.startsWith('/__system/destroy-plugin')) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pluginId = url.searchParams.get('id');
        
        if (pluginId) {
          // Console Simulation (In Terminal)
          console.log('\n\x1b[41m\x1b[37m [SYSTEM] INITIATING HALT SEQUENCE... \x1b[0m');
          console.log('\x1b[33m [SERVER] Stopping localhost process...\x1b[0m');
          
          // Disk Deletion Logic
          const pluginsDir = path.resolve('plugins'); // Resolves relative to project root
          let deletedPath = null;

          if (fs.existsSync(pluginsDir)) {
             try {
                 const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
                 for (const entry of entries) {
                     if (entry.isDirectory()) {
                         // Check manifest to see if ID matches
                         const manifestPath = path.join(pluginsDir, entry.name, 'public', 'manifest.json');
                         if (fs.existsSync(manifestPath)) {
                             const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
                             if (manifest.id === pluginId) {
                                 const targetPath = path.join(pluginsDir, entry.name);
                                 console.log(`\x1b[31m [DISK] Deleting artifact: ${targetPath}\x1b[0m`);
                                 
                                 // ACTUAL DELETION
                                 fs.rmSync(targetPath, { recursive: true, force: true });
                                 
                                 deletedPath = targetPath;
                                 console.log(`\x1b[31m [DISK] Wiping sectors... DONE.\x1b[0m`);
                                 break;
                             }
                         }
                     }
                 }
             } catch (e) {
                 console.error("\x1b[31m [ERROR] Disk operation failed:\x1b[0m", e);
             }
          }

          if (!deletedPath) {
              console.log(`\x1b[33m [DISK] Warning: No physical folder found for ID ${pluginId}. Cleaning virtual config only.\x1b[0m`);
          }
          
          // Send success to frontend before killing process
          res.statusCode = 200;
          res.end(JSON.stringify({ status: 'halted', deleted: deletedPath }));
          
          // Kill Process (Simulate Restart requirement)
          setTimeout(() => {
              console.log('\x1b[32m [BOOT] System Halted. Please restart server manually to apply kernel changes.\x1b[0m');
              (process as any).exit(0);
          }, 500);
          
          return;
        }
      }
      next();
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), galagaSystemPlugin()],
  server: {
    // CHANGE PORT HERE
    port: 5173, 
    // Set to true to expose to your local network (e.g. access via phone)
    host: true, 
  }
});
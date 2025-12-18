import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Custom middleware to handle System Halt and Disk Operations
const galagaSystemPlugin = () => ({
  name: 'galaga-system',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      
      // 1. ENDPOINT: LIST PLUGINS (Scan Disk & Return Full Configs)
      if (req.url?.startsWith('/__system/list-plugins') && req.method === 'GET') {
        const pluginsDir = path.join(process.cwd(), 'plugins');
        const loadedPlugins: any[] = [];

        if (fs.existsSync(pluginsDir)) {
          try {
            const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
            for (const entry of entries) {
              if (entry.isDirectory()) {
                const publicDir = path.join(pluginsDir, entry.name, 'public');
                const manifestPath = path.join(publicDir, 'manifest.json');
                
                if (fs.existsSync(manifestPath)) {
                  try {
                    // Read Manifest
                    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
                    const manifest = JSON.parse(manifestContent);
                    
                    // Read Files defined in manifest
                    const files: Record<string, string> = {};
                    
                    // Helper to read file as Data URI (simplifies frontend loading)
                    const readFile = (filename: string, mime: string) => {
                        const filePath = path.join(publicDir, filename);
                        if (fs.existsSync(filePath)) {
                            const content = fs.readFileSync(filePath, 'utf-8'); // Assuming text based plugins for now
                            // Simple Base64 encoding for safe transport/execution in browser
                            const b64 = Buffer.from(content).toString('base64');
                            files[filename] = `data:${mime};base64,${b64}`;
                        }
                    };

                    if (manifest.main) readFile(manifest.main, 'text/javascript');
                    if (manifest.style) readFile(manifest.style, 'text/css');

                    loadedPlugins.push({
                        id: manifest.id,
                        manifest: manifest,
                        files: files,
                        enabled: false // Default state from disk is disabled, User config overrides this
                    });
                  } catch (e) {
                    console.error(`Error loading plugin ${entry.name}:`, e);
                  }
                }
              }
            }
          } catch (e) {
            console.error("Error scanning plugins dir:", e);
          }
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(loadedPlugins));
        return;
      }

      // 2. ENDPOINT: UPLOAD PLUGIN (Write to Disk)
      if (req.url?.startsWith('/__system/upload-plugin') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { id, manifest, files } = JSON.parse(body);
                
                if (!id || !manifest) {
                    throw new Error("Missing ID or Manifest");
                }

                // SECURITY: Ensure ID is safe filename
                const safeId = id.replace(/[^a-zA-Z0-9.-]/g, '_');
                const pluginDir = path.join(process.cwd(), 'plugins', safeId);
                const publicDir = path.join(pluginDir, 'public');

                // 1. Clean existing
                if (fs.existsSync(pluginDir)) {
                    fs.rmSync(pluginDir, { recursive: true, force: true });
                }
                
                // 2. Create Dirs
                fs.mkdirSync(publicDir, { recursive: true });

                // 3. Write Manifest
                fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

                // 4. Write Files
                if (files) {
                    for (const [filename, content] of Object.entries(files)) {
                        const safeName = path.basename(filename);
                        fs.writeFileSync(path.join(publicDir, safeName), content as string);
                    }
                }

                console.log(`\x1b[32m [SYSTEM] Plugin installed to disk: plugins/${safeId} \x1b[0m`);

                res.statusCode = 200;
                res.end(JSON.stringify({ success: true }));
            } catch (e: any) {
                console.error("Upload failed:", e);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
      }

      // 3. ENDPOINT: DESTROY PLUGIN (Delete Disk)
      if (req.url?.startsWith('/__system/destroy-plugin')) {
        try {
          // Robust URL parsing
          const urlObj = new URL(req.url, 'http://localhost');
          const pluginId = urlObj.searchParams.get('id');
          
          if (pluginId) {
            console.log('\n\x1b[41m\x1b[37m [SYSTEM] RECEIVED HALT COMMAND. INITIATING SEQUENCE... \x1b[0m');
            
            // Sanitize ID exactly as we do in upload
            const safeId = pluginId.replace(/[^a-zA-Z0-9.-]/g, '_');
            const targetPath = path.join(process.cwd(), 'plugins', safeId);
            
            // Respond to client FIRST so UI can show "Stopped" state
            res.statusCode = 200;
            res.end(JSON.stringify({ status: 'halting' }));
            
            // Schedule Shutdown & Deletion
            setTimeout(async () => {
               try {
                   console.log(`\x1b[33m [SERVER] Shutting down Vite server to release file locks...\x1b[0m`);
                   await server.close(); // Close server/watchers to release locks (Crucial for Windows)

                   console.log(`\x1b[33m [DISK] Targeting artifact: ${targetPath}\x1b[0m`);
                   if (fs.existsSync(targetPath)) {
                      // Small delay to ensure OS releases handles
                      await new Promise(r => setTimeout(r, 500)); 
                      
                      fs.rmSync(targetPath, { recursive: true, force: true });
                      console.log(`\x1b[32m [DISK] Artifact destroyed successfully.\x1b[0m`);
                   } else {
                      console.log(`\x1b[33m [DISK] Path not found on disk. Assuming clean.\x1b[0m`);
                   }
               } catch (err) {
                   console.error(`\x1b[31m [FATAL] Error during destruction sequence: ${err}\x1b[0m`);
               } finally {
                   console.log('\x1b[31m [SYSTEM] TERMINATED.\x1b[0m');
                   process.exit(0);
               }
            }, 100);
            
            return;
          }
        } catch (e) {
            console.error("Destroy handler error:", e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Internal Server Error" }));
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
    port: 5173, 
    host: true, 
  }
});
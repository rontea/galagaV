
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Custom middleware to handle System Halt and Disk Operations
const galagaSystemPlugin = () => ({
  name: 'galaga-system',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      
      const rootDir = (process as any).cwd();
      const pluginsDir = path.resolve(rootDir, 'plugins');
      const storageDir = path.resolve(rootDir, 'storage');

      // Ensure directories exist
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }
      if (!fs.existsSync(pluginsDir)) {
        fs.mkdirSync(pluginsDir, { recursive: true });
      }

      // 1. ENDPOINT: LOAD DATABASE FROM DISK
      if (req.url?.startsWith('/__system/db-load') && req.method === 'GET') {
        const dbPath = path.join(storageDir, 'galagav.sqlite');
        if (fs.existsSync(dbPath)) {
          const fileBuffer = fs.readFileSync(dbPath);
          res.setHeader('Content-Type', 'application/octet-stream');
          res.end(fileBuffer);
        } else {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: "No database file found on disk." }));
        }
        return;
      }

      // 2. ENDPOINT: SAVE DATABASE TO DISK
      if (req.url?.startsWith('/__system/db-save') && req.method === 'POST') {
        const chunks: any[] = [];
        req.on('data', (chunk: any) => chunks.push(chunk));
        req.on('end', () => {
            try {
                const buffer = Buffer.concat(chunks);
                const dbPath = path.join(storageDir, 'galagav.sqlite');
                fs.writeFileSync(dbPath, buffer);
                console.log(`\x1b[32m [SQLITE_SYNC] Database persisted to disk: ${dbPath} (${buffer.length} bytes) \x1b[0m`);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true }));
            } catch (e: any) {
                console.error("[SQLITE_SYNC] Write failed:", e);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
      }

      // 3. ENDPOINT: LIST PLUGINS
      if (req.url?.startsWith('/__system/list-plugins') && req.method === 'GET') {
        const loadedPlugins: any[] = [];
        if (fs.existsSync(pluginsDir)) {
          try {
            const pluginFolders = fs.readdirSync(pluginsDir, { withFileTypes: true });
            for (const folder of pluginFolders) {
              if (folder.isDirectory()) {
                const pluginPath = path.join(pluginsDir, folder.name);
                const possibleManifests = [
                    path.join(pluginPath, 'public', 'manifest.json'),
                    path.join(pluginPath, 'dist', 'manifest.json'),
                    path.join(pluginPath, 'manifest.json')
                ];
                let manifestPath = possibleManifests.find(p => fs.existsSync(p));
                if (manifestPath) {
                  try {
                    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
                    const manifest = JSON.parse(manifestContent);
                    const manifestBaseDir = path.dirname(manifestPath);
                    const files: Record<string, string> = {};
                    const tryReadFile = (filename: string, mime: string) => {
                        let filePath = path.join(manifestBaseDir, filename);
                        if (!fs.existsSync(filePath)) filePath = path.join(pluginPath, filename);
                        if (fs.existsSync(filePath) && !fs.lstatSync(filePath).isDirectory()) {
                            const content = fs.readFileSync(filePath);
                            files[filename] = `data:${mime};base64,${content.toString('base64')}`;
                            return true;
                        }
                        return false;
                    };
                    if (manifest.main && tryReadFile(manifest.main, 'text/javascript')) {
                        if (manifest.style) tryReadFile(manifest.style, 'text/css');
                        loadedPlugins.push({ id: manifest.id, manifest, files, enabled: false });
                    }
                  } catch (e) {}
                }
              }
            }
          } catch (e) {}
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(loadedPlugins));
        return;
      }

      // 4. ENDPOINT: UPLOAD PLUGIN
      if (req.url?.startsWith('/__system/upload-plugin') && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { id, manifest, files } = JSON.parse(body);
                const safeId = id.replace(/[^a-zA-Z0-9.-]/g, '_');
                const pluginDir = path.join(pluginsDir, safeId);
                const publicDir = path.join(pluginDir, 'public');
                if (fs.existsSync(pluginDir)) fs.rmSync(pluginDir, { recursive: true, force: true });
                fs.mkdirSync(publicDir, { recursive: true });
                fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
                if (files) {
                    for (const [filename, content] of Object.entries(files)) {
                        const targetPath = path.join(publicDir, filename);
                        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
                        fs.writeFileSync(targetPath, content as string);
                    }
                }
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true }));
            } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
      }

      // 5. ENDPOINT: DELETE PLUGIN FROM DISK
      if (req.url?.startsWith('/__system/delete-plugin') && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { id } = JSON.parse(body);
                if (!id) throw new Error("Plugin ID is required for deletion.");
                
                // Scan to find the folder that has this ID in manifest
                const pluginFolders = fs.readdirSync(pluginsDir, { withFileTypes: true });
                let targetFolder: string | null = null;

                for (const folder of pluginFolders) {
                    if (folder.isDirectory()) {
                        const pluginPath = path.join(pluginsDir, folder.name);
                        const possibleManifests = [
                            path.join(pluginPath, 'public', 'manifest.json'),
                            path.join(pluginPath, 'dist', 'manifest.json'),
                            path.join(pluginPath, 'manifest.json')
                        ];
                        const manifestPath = possibleManifests.find(p => fs.existsSync(p));
                        if (manifestPath) {
                            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
                            if (manifest.id === id) {
                                targetFolder = pluginPath;
                                break;
                            }
                        }
                    }
                }

                if (targetFolder && fs.existsSync(targetFolder)) {
                    fs.rmSync(targetFolder, { recursive: true, force: true });
                    console.log(`\x1b[31m [PLUGIN_SYSTEM] Physically deleted plugin from disk: ${targetFolder} \x1b[0m`);
                    res.statusCode = 200;
                    res.end(JSON.stringify({ success: true }));
                } else {
                    // Not on disk (maybe only in DB), that's fine
                    res.statusCode = 200;
                    res.end(JSON.stringify({ success: true, message: "Plugin not found on disk." }));
                }
            } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
      }

      next();
    });
  }
});

export default defineConfig({
  plugins: [react(), galagaSystemPlugin()],
  server: {
    port: 5173, 
    host: true, 
  }
});

import React, { useState, useEffect } from 'react';
import { Settings, X, Terminal, Circle, Plus, Trash2, Power, AlertCircle, Upload, Package, FileCode, RefreshCw, Download, HardDrive, Check, Ban, Loader2, Play, Eye, Skull } from 'lucide-react';
import { GlobalConfig, PluginConfig, PluginManifest } from '../types';
import { FULL_ICON_MAP, DEFAULT_PROJECT_KEYS, DEFAULT_STATUS_KEYS } from './ProjectList';
import { getJiraPlugin, JIRA_CSS, JIRA_JS, JIRA_MANIFEST } from '../data/defaultPlugins';
import JSZip from 'jszip';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GlobalConfig;
  onUpdateConfig: (newConfig: GlobalConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onUpdateConfig }) => {
  const [activeTab, setActiveTab] = useState<'project' | 'status' | 'plugins'>('project');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Simulation State
  const [shutdownState, setShutdownState] = useState<'none' | 'stopping' | 'stopped' | 'booting'>('none');
  const [targetPluginId, setTargetPluginId] = useState<string | null>(null);

  // State for blocked plugins (using state setter for instant UI updates)
  const [blockedPlugins, setBlockedPlugins] = useState<string[]>(() => 
    JSON.parse(localStorage.getItem('galaga_blocked_plugins') || '[]')
  );

  // State for plugins actually available on disk (verified by backend)
  const [diskPlugins, setDiskPlugins] = useState<string[]>([]);

  // Fetch disk state when opening plugins tab
  useEffect(() => {
    if (isOpen && activeTab === 'plugins') {
        fetch('/__system/list-plugins')
           .then(res => {
               if (!res.ok) throw new Error("System endpoint missing");
               return res.json();
           })
           .then((ids: string[]) => setDiskPlugins(ids))
           .catch(err => {
               console.warn("Plugin system offline (likely static build), falling back to defaults.", err);
               // If backend check fails, assume static defaults are available to avoid breaking demo
               setDiskPlugins([getJiraPlugin().id]);
           });
    }
  }, [isOpen, activeTab]);

  if (!isOpen && shutdownState === 'none') return null;

  // --- Icon Handlers ---
  const handleAddIcon = (type: 'project' | 'status', key: string) => {
    if (type === 'project') {
      if (!config.projectIcons.includes(key)) {
        onUpdateConfig({ ...config, projectIcons: [...config.projectIcons, key] });
      }
    } else {
      if (!config.statusIcons.includes(key)) {
        onUpdateConfig({ ...config, statusIcons: [...config.statusIcons, key] });
      }
    }
  };

  const handleRemoveIcon = (type: 'project' | 'status', key: string) => {
    if (type === 'project') {
      onUpdateConfig({ ...config, projectIcons: config.projectIcons.filter(k => k !== key) });
    } else {
      onUpdateConfig({ ...config, statusIcons: config.statusIcons.filter(k => k !== key) });
    }
  };

  // --- Plugin Handlers (Zip Based) ---

  const handleTogglePlugin = (id: string) => {
    const updatedPlugins = (config.plugins || []).map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    );
    onUpdateConfig({ ...config, plugins: updatedPlugins });
  };

  // Standard Uninstall (Removes from active config, allows reinstall)
  const handleDeletePlugin = (id: string) => {
    if (confirm("Uninstall this plugin? The system will reload to clean up resources.")) {
        // Direct LocalStorage manipulation to avoid React state race conditions during reload
        const currentConfigStr = localStorage.getItem('galaga_global_config_v1');
        if (currentConfigStr) {
            const currentConfig = JSON.parse(currentConfigStr) as GlobalConfig;
            const updatedPlugins = (currentConfig.plugins || []).filter(p => p.id !== id);
            const newConfig = { ...currentConfig, plugins: updatedPlugins };
            localStorage.setItem('galaga_global_config_v1', JSON.stringify(newConfig));
        }
        window.location.reload();
    }
  };

  // Soft Block (Move to Trash/Blocked List) - No Simulation
  const handleSoftBlockPlugin = (id: string) => {
    if (confirm("Remove this plugin from the Repository? It will be moved to the 'Blocked / Deleted' list below.")) {
        const newBlocked = [...blockedPlugins];
        if (!newBlocked.includes(id)) {
            newBlocked.push(id);
            localStorage.setItem('galaga_blocked_plugins', JSON.stringify(newBlocked));
            setBlockedPlugins(newBlocked);
        }
    }
  };

  // Hard Delete (Destroy from Blocked List) - Triggers Actual System Halt
  const handleHardDeletePlugin = async (id: string) => {
    if (confirm("WARNING: This will initiate a SYSTEM HALT to permanently scrub this plugin from the disk. This action cannot be undone. Proceed?")) {
        setTargetPluginId(id);
        
        // 1. Start Visual Sequence
        console.clear();
        console.log('%c [SYSTEM] INITIATING HALT SEQUENCE...', 'color: red; font-weight: bold; font-size: 16px;');
        setShutdownState('stopping');
        
        // 2. Perform Data Cleanup (Client Side)
        try {
            // REMOVE from Blocked List immediately so it disappears from UI
            const newBlocked = blockedPlugins.filter((bid: string) => bid !== id);
            setBlockedPlugins(newBlocked);
            localStorage.setItem('galaga_blocked_plugins', JSON.stringify(newBlocked));

            // CRITICAL: We DO NOT remove it from 'galaga_installed_default_plugins'. 
            // We want App.tsx to remember "we have seen this plugin before", so it 
            // DOES NOT auto-install it on the next boot.
        } catch (e) {
            console.error("Critical storage error during shutdown:", e);
        }

        // 3. Call Backend to Delete File & Kill Server
        try {
            // Give UI a moment to render the "Halt" screen
            setTimeout(async () => {
                try {
                    await fetch(`/__system/destroy-plugin?id=${id}`, { method: 'POST' });
                    // If successful, the server dies, and the next steps might fail or we just hang on 'stopped'.
                } catch (e) {
                    // This is actually expected if the server kills itself before responding fully
                    console.log("Connection lost. Server halted.");
                }
            }, 1000);
        } catch (e) {
            console.error("Backend communication failed", e);
        }
            
        // 4. UI Simulation Sequence (Visuals for the user while server dies)
        setTimeout(() => {
            console.log('%c [SYSTEM] Server stopped.', 'color: gray;');
            setShutdownState('stopped');
            
            // Note: We do NOT reload here anymore because the server is dead.
            // We leave the user at the "Server Stopped" screen.
            setTimeout(() => {
                 // Try to reload, if server is down, browser will show error page, which is correct behavior for "Server Stopped"
                 console.log('%c [BOOT] Attempting restart...', 'color: green;');
                 window.location.reload(); 
            }, 4000);
        }, 3000);
    }
  };

  const handleRestorePlugin = (id: string) => {
      const newBlocked = blockedPlugins.filter((bid: string) => bid !== id);
      setBlockedPlugins(newBlocked);
      localStorage.setItem('galaga_blocked_plugins', JSON.stringify(newBlocked));
  };

  const handleInstallFromRepo = (plugin: PluginConfig) => {
    // Enable by default when installing
    const newPlugin = { ...plugin, enabled: true };
    const otherPlugins = (config.plugins || []).filter(p => p.id !== plugin.id);
    onUpdateConfig({
        ...config,
        plugins: [...otherPlugins, newPlugin]
    });
  };

  const handleDownloadSampleZip = async () => {
    try {
      const zip = new JSZip();

      // --- ROOT FILES ---
      
      // package.json
      zip.file("package.json", JSON.stringify({
        "name": "galaga-plugin-jira-theme",
        "private": true,
        "version": "1.0.0",
        "type": "module",
        "scripts": {
            "dev": "vite",
            "build": "tsc && vite build"
        },
        "dependencies": {
            "react": "^18.3.1",
            "react-dom": "^18.3.1",
            "lucide-react": "^0.378.0"
        },
        "devDependencies": {
            "@types/react": "^18.3.1",
            "@types/react-dom": "^18.3.0",
            "@vitejs/plugin-react": "^4.2.1",
            "typescript": "^5.4.5",
            "vite": "^5.2.11"
        }
      }, null, 2));

      // vite.config.ts
      zip.file("vite.config.ts", `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/index.tsx',
      name: '${JIRA_MANIFEST.globalVar}',
      fileName: (format) => \`index.js\`,
      formats: ['umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'lucide-react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'lucide-react': 'Lucide'
        },
        name: '${JIRA_MANIFEST.globalVar}',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css';
          return assetInfo.name as string;
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});`);

      // tsconfig.json
      zip.file("tsconfig.json", JSON.stringify({
        "compilerOptions": {
            "target": "ES2020",
            "useDefineForClassFields": true,
            "lib": ["ES2020", "DOM", "DOM.Iterable"],
            "module": "ESNext",
            "skipLibCheck": true,
            "moduleResolution": "bundler",
            "allowImportingTsExtensions": true,
            "resolveJsonModule": true,
            "isolatedModules": true,
            "noEmit": true,
            "jsx": "react-jsx",
            "strict": true,
            "noUnusedLocals": true,
            "noUnusedParameters": true,
            "noFallthroughCasesInSwitch": true
        },
        "include": ["src"]
      }, null, 2));

      // README.md
      zip.file("README.md", `# GalagaV Plugin: ${JIRA_MANIFEST.name}

This is a sample plugin source project for the GalagaV Project Dashboard.

## 🚀 How to Build & Install

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Build the Plugin**
   \`\`\`bash
   npm run build
   \`\`\`
   This will create a \`dist/\` folder containing \`index.js\`, \`style.css\`, and \`manifest.json\`.

3. **Package for Upload**
   - Go into the \`dist/\` folder:
     \`\`\`bash
     cd dist
     \`\`\`
   - Select all files (\`index.js\`, \`style.css\`, \`manifest.json\`).
   - Create a **ZIP file** of these files directly (Do NOT zip the parent folder).
     - *Mac:* Right-click selection > Compress
     - *Windows:* Right-click selection > Send to > Compressed folder

4. **Upload to GalagaV**
   - Go to Settings > Plugins.
   - Drag and drop your new ZIP file into the upload zone.
`);

      // --- PUBLIC FOLDER ---
      const publicFolder = zip.folder("public");
      if (publicFolder) {
         publicFolder.file("manifest.json", JSON.stringify(JIRA_MANIFEST, null, 2));
      }

      // --- SRC FOLDER ---
      const srcFolder = zip.folder("src");
      if (srcFolder) {
          // index.tsx
          srcFolder.file("index.tsx", `import React from 'react';

const JiraThemeInfo: React.FC = () => {
  return (
    <div className="p-8 flex flex-col items-center justify-center h-full text-center">
      <div className="bg-[#DEEBFF] p-4 rounded-full mb-4">
        {/* We use window.Lucide because it's available globally, or we can assume lucide-react is externalized correctly by vite config */}
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
      </div>
      <h1 className="text-2xl font-bold text-[#172B4D] mb-4">Enterprise Theme Active</h1>
      <p className="text-[#5E6C84] max-w-md">
        The system interface has been updated to use the Enterprise Design System.
        This theme overrides global styles to provide a cleaner, sans-serif look with professional blue accents.
      </p>
    </div>
  );
};

// The Host expects a default export with a Component property (for tools)
// For themes, this component is just metadata/preview
const plugin = {
  Component: JiraThemeInfo
};

export default plugin;
`);

          // style.css
          srcFolder.file("style.css", JIRA_CSS);
      }

      // Generate Blob
      const blob = await zip.generateAsync({ type: "blob" });
      const href = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = href;
      link.download = "jira-theme-plugin-source.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);

    } catch (err) {
      console.error("Failed to generate sample zip", err);
      alert("Error generating sample zip file.");
    }
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsProcessing(true);

    try {
        const zip = new JSZip();
        const content = await zip.loadAsync(file);

        // 1. Look for manifest.json
        const manifestFile = content.file("manifest.json");
        if (!manifestFile) {
            throw new Error("Invalid Plugin: Missing 'manifest.json' in the root of the zip file.");
        }

        const manifestStr = await manifestFile.async("string");
        let manifest: PluginManifest;
        try {
            manifest = JSON.parse(manifestStr);
        } catch (e) {
            throw new Error("Invalid Plugin: 'manifest.json' is not valid JSON.");
        }

        // Validate Manifest
        if (!manifest.id || !manifest.name || !manifest.main || !manifest.globalVar) {
            throw new Error("Invalid Manifest: Missing required fields (id, name, main, globalVar).");
        }

        // 2. Read 'main' entry script (JS)
        const scriptFile = content.file(manifest.main);
        if (!scriptFile) {
            throw new Error(`Invalid Plugin: Entry file '${manifest.main}' not found in zip.`);
        }
        const scriptBlob = await scriptFile.async("blob");
        
        // Convert to Data URI for storage
        const scriptReader = new FileReader();
        const scriptDataUri = await new Promise<string>((resolve, reject) => {
            scriptReader.onload = () => resolve(scriptReader.result as string);
            scriptReader.onerror = reject;
            scriptReader.readAsDataURL(scriptBlob);
        });

        // 3. Read 'style' css (Optional)
        let styleDataUri = '';
        if (manifest.style) {
            const styleFile = content.file(manifest.style);
            if (styleFile) {
                const styleBlob = await styleFile.async("blob");
                 const styleReader = new FileReader();
                 styleDataUri = await new Promise<string>((resolve, reject) => {
                    styleReader.onload = () => resolve(styleReader.result as string);
                    styleReader.onerror = reject;
                    styleReader.readAsDataURL(styleBlob);
                });
            }
        }

        // 4. Create Virtual "Folder" Object
        const newPlugin: PluginConfig = {
            id: manifest.id,
            manifest: manifest,
            files: {
                [manifest.main]: scriptDataUri,
                ...(styleDataUri ? { [manifest.style!]: styleDataUri } : {})
            },
            enabled: true
        };

        // 5. Save/Update Global Config
        // Remove existing version if present
        const otherPlugins = (config.plugins || []).filter(p => p.id !== manifest.id);
        
        onUpdateConfig({
            ...config,
            plugins: [...otherPlugins, newPlugin]
        });

        alert(`Plugin "${manifest.name}" (v${manifest.version}) installed successfully!`);

    } catch (err: any) {
        console.error("Plugin Install Error:", err);
        setUploadError(err.message || "Failed to parse plugin file.");
    } finally {
        setIsProcessing(false);
        // Clear input
        e.target.value = '';
    }
  };

  // --- Render Helpers ---
  const renderIconGrid = (type: 'project' | 'status') => {
    const activeKeys = type === 'project' ? config.projectIcons : config.statusIcons;
    const defaultKeys = type === 'project' ? DEFAULT_PROJECT_KEYS : DEFAULT_STATUS_KEYS;
    const availableKeys = Object.keys(FULL_ICON_MAP).filter(k => !activeKeys.includes(k));

    return (
      <div className="space-y-6">
        {/* Active Icons */}
        <div>
          <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
            Active Icons <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">{activeKeys.length}</span>
          </h3>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
            {activeKeys.map(key => {
              const Icon = FULL_ICON_MAP[key] || Terminal;
              const isDefault = defaultKeys.includes(key);
              return (
                <div key={key} className="group relative flex items-center justify-center p-2 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 shadow-sm">
                  <Icon size={20} className="text-slate-600 dark:text-slate-300" />
                  {!isDefault && (
                    <button
                      onClick={() => handleRemoveIcon(type, key)}
                      className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Library */}
        <div>
          <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-3">Available Library</h3>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
            {availableKeys.map(key => {
              const Icon = FULL_ICON_MAP[key];
              return (
                <button
                  key={key}
                  onClick={() => handleAddIcon(type, key)}
                  className="flex items-center justify-center p-2 bg-white dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:border-cyan-500 text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all"
                >
                  <Icon size={20} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderPlugins = () => {
    // Repository Logic: 
    // 1. Must NOT be blocked/deleted (soft delete list)
    // 2. Must exist on disk (verified by backend) - OR fallback to static if check failed
    const repoPlugins = [getJiraPlugin()].filter(p => !blockedPlugins.includes(p.id) && diskPlugins.includes(p.id));

    return (
        <div className="space-y-8">
            <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-800 dark:text-indigo-300">
                <div className="flex items-start gap-2">
                    <Package size={16} className="mt-0.5 flex-shrink-0" />
                    <div>
                        <strong>Plugin Manager:</strong> 
                        <br/>
                        Plugins are sandboxed React components. You can install official default plugins or upload your own <code>.zip</code> bundles.
                    </div>
                </div>
            </div>

            {/* Install Area */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors text-center relative">
                {isProcessing ? (
                     <div className="flex flex-col items-center justify-center py-4">
                        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-xs font-bold uppercase text-slate-500">Extracting Plugin Package...</span>
                     </div>
                ) : (
                    <>
                        <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Upload New Plugin</h3>
                        <p className="text-xs text-slate-500 mb-4">Drag and drop a <strong>.zip</strong> file here or click to browse.</p>
                        
                        <div className="flex justify-center gap-3 relative z-20">
                            <input 
                                type="file" 
                                accept=".zip" 
                                onChange={handleZipUpload} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold uppercase shadow-sm pointer-events-none">
                                Select Zip
                            </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleDownloadSampleZip(); }}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold uppercase shadow-sm hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-2 pointer-events-auto relative z-30"
                            >
                                <Download size={14} /> Download Sample
                            </button>
                        </div>
                    </>
                )}
                {uploadError && (
                    <div className="mt-4 p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs rounded border border-rose-200 dark:border-rose-900 font-mono">
                        {uploadError}
                    </div>
                )}
            </div>

            {/* Installed List */}
            <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                     <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                        <Terminal size={14} /> Installed Plugins
                     </span>
                </div>
                {(config.plugins || []).length === 0 && (
                    <p className="text-center text-xs text-slate-400 italic py-4">No plugins installed.</p>
                )}
                {(config.plugins || []).map(plugin => {
                    const isTheme = plugin.manifest.type === 'theme';

                    return (
                        <div key={plugin.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm animate-in fade-in slide-in-from-right-2">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${plugin.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Power size={14} />
                                </div>
                                <div>
                                    <h4 className={`text-sm font-bold ${plugin.enabled ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                        {plugin.manifest?.name || plugin.id} 
                                        <span className="text-[10px] text-slate-400 font-normal ml-2">v{plugin.manifest?.version || '0.0.0'}</span>
                                        <span className={`ml-2 text-[9px] uppercase px-1.5 py-0.5 rounded border ${isTheme ? 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 dark:border-fuchsia-900' : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900'}`}>
                                            {isTheme ? 'Theme' : 'Tool'}
                                        </span>
                                    </h4>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                        <FileCode size={10} />
                                        <code>{plugin.manifest?.main}</code>
                                        {plugin.manifest?.style && <span className="text-indigo-500">+ Styles</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleTogglePlugin(plugin.id)}
                                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${plugin.enabled ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                >
                                    {plugin.enabled ? 'Active' : 'Disabled'}
                                </button>
                                
                                <button 
                                    onClick={() => handleDeletePlugin(plugin.id)}
                                    disabled={plugin.enabled}
                                    className={`p-2 transition-colors rounded ${
                                        plugin.enabled 
                                        ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' 
                                        : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                                    }`}
                                    title={plugin.enabled ? "Disable plugin to uninstall" : "Uninstall (Remove from active list)"}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Plugin Repository (Local Defaults) */}
            <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                     <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                        <HardDrive size={14} /> Local Repository (plugins/)
                     </span>
                </div>
                {repoPlugins.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 italic py-4">Repository is empty or all defaults have been permanently deleted.</p>
                ) : (
                    repoPlugins.map(repoPlugin => {
                        const isInstalled = (config.plugins || []).some(p => p.id === repoPlugin.id);
                        return (
                            <div key={repoPlugin.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500">
                                        <Package size={14} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {repoPlugin.manifest.name}
                                        </h4>
                                        <p className="text-xs text-slate-500">{repoPlugin.manifest.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isInstalled ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-600 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded">
                                            <Check size={12} /> Installed
                                        </span>
                                    ) : (
                                        <button 
                                            onClick={() => handleInstallFromRepo(repoPlugin)}
                                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold uppercase transition-colors"
                                        >
                                            Install
                                        </button>
                                    )}
                                    
                                    <button 
                                        onClick={() => handleSoftBlockPlugin(repoPlugin.id)}
                                        disabled={isInstalled}
                                        className={`p-2 transition-colors rounded ${
                                            isInstalled
                                            ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                                        }`}
                                        title={isInstalled ? "Uninstall first to delete" : "Delete (Move to Trash)"}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Blocked/Ignored Plugins */}
            {blockedPlugins.length > 0 && (
                <div className="space-y-2 pt-8 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between pb-2">
                        <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                            <Ban size={14} /> Blocked / Deleted Plugins
                        </span>
                    </div>
                    {blockedPlugins.map(bid => {
                        // Try to resolve name from default known plugins, otherwise just show ID
                        const knownPlugin = [getJiraPlugin()].find(p => p.id === bid);
                        return (
                            <div key={bid} className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-lg opacity-75 hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/20 text-rose-500">
                                        <Ban size={14} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                            {knownPlugin ? knownPlugin.manifest.name : bid}
                                        </h4>
                                        <p className="text-[10px] text-slate-400">Permanently blocked from auto-installation.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleRestorePlugin(bid)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-500 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded text-xs font-bold uppercase transition-colors"
                                        title="Restore to Local Repository"
                                    >
                                        <Eye size={12} /> Restore
                                    </button>
                                    <button 
                                        onClick={() => handleHardDeletePlugin(bid)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 text-rose-500 hover:text-rose-700 border border-slate-200 dark:border-slate-700 hover:border-rose-500 rounded text-xs font-bold uppercase transition-colors"
                                        title="Permanently Destroy (System Halt)"
                                    >
                                        <Trash2 size={12} /> Destroy
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
  }

  return (
    <>
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in" role="dialog">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex-shrink-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-mono">
                <Settings size={18} className="text-cyan-600 dark:text-cyan-500" />
                SYSTEM CONFIGURATION
            </h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                <X size={20} />
            </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
            <button 
                onClick={() => setActiveTab('project')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'project' ? 'bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400 border-b-2 border-cyan-500' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
                Project Icons
            </button>
            <button 
                onClick={() => setActiveTab('status')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'status' ? 'bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400 border-b-2 border-cyan-500' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
                Status Icons
            </button>
            <button 
                onClick={() => setActiveTab('plugins')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'plugins' ? 'bg-slate-100 dark:bg-slate-800 text-fuchsia-700 dark:text-fuchsia-400 border-b-2 border-fuchsia-500' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
                Plugins
            </button>
            </div>

            {/* Content */}
            <div className="p-6 bg-white dark:bg-slate-900 overflow-y-auto custom-scrollbar flex-1">
            {activeTab === 'plugins' ? renderPlugins() : renderIconGrid(activeTab)}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-right flex-shrink-0">
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-bold uppercase rounded border border-slate-300 dark:border-slate-700"
            >
                Done
            </button>
            </div>
        </div>
        </div>

        {/* Server Stop/Start Simulation Overlay */}
        {shutdownState !== 'none' && (
            <div className="fixed inset-0 z-[9999] bg-black text-white font-mono flex flex-col items-center justify-center p-8 cursor-wait">
                {shutdownState === 'stopping' && (
                    <>
                        <Loader2 size={64} className="text-red-600 animate-spin mb-8" />
                        <h1 className="text-4xl font-bold mb-4 text-red-600 tracking-widest animate-pulse">SYSTEM HALT</h1>
                        <div className="text-left space-y-2 text-slate-400 font-mono text-sm w-96">
                            <p className="animate-pulse">&gt; [SYSTEM] Received SIGTERM.</p>
                            <p>&gt; [SERVER] Stopping localhost process...</p>
                            <p>&gt; [DISK] Target identified: {targetPluginId}</p>
                            <p className="text-red-500">&gt; [DISK] rm -rf /plugins/{targetPluginId}</p>
                            <p className="text-white animate-pulse">&gt; [DISK] Writing changes to disk...</p>
                        </div>
                        <div className="w-96 h-1 bg-slate-900 mt-8 rounded-full overflow-hidden">
                             <div className="h-full bg-red-600 animate-[width_2s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
                        </div>
                    </>
                )}
                {shutdownState === 'stopped' && (
                     <>
                        <div className="w-16 h-16 rounded-full border-4 border-slate-800 mb-8 relative">
                            <div className="absolute inset-0 bg-slate-900 rounded-full"></div>
                        </div>
                        <h1 className="text-4xl font-bold mb-4 text-slate-700 tracking-widest">SERVER STOPPED</h1>
                        <p className="text-slate-600 font-mono text-sm">&gt; System is safe to power off.</p>
                        <p className="text-slate-800 font-mono text-xs mt-2">Waiting for restart signal...</p>
                    </>
                )}
                {shutdownState === 'booting' && (
                     <>
                        <Terminal size={64} className="text-green-500 mb-8 animate-bounce" />
                        <h1 className="text-4xl font-bold mb-4 text-green-500 tracking-widest">INITIALIZING...</h1>
                        <div className="text-left space-y-1 text-green-900 font-mono text-sm w-96">
                            <p>&gt; mounting /dev/root...</p>
                            <p>&gt; starting React_DOM...</p>
                            <p>&gt; loading configuration...</p>
                            <p className="text-green-500">&gt; SYSTEM READY.</p>
                        </div>
                    </>
                )}
            </div>
        )}
    </>
  );
};

export default SettingsModal;
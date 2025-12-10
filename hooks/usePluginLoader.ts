import { useState, useEffect } from 'react';
import { PluginConfig } from '../types';

interface PluginState {
  plugin: any | null;
  loading: boolean;
  error: string | null;
}

export const usePluginLoader = (config: PluginConfig): PluginState => {
  const [state, setState] = useState<PluginState>({
    plugin: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!config || !config.enabled) return;

    const { manifest, files } = config;
    const globalName = manifest.globalVar;
    const mainScriptUrl = files[manifest.main];
    const styleUrl = manifest.style ? files[manifest.style] : null;

    if (!mainScriptUrl) {
        setState({ plugin: null, loading: false, error: `Entry file '${manifest.main}' missing in plugin package.` });
        return;
    }

    // 1. Check if already loaded globally
    const existingPlugin = (window as any)[globalName];
    if (existingPlugin) {
      const resolved = existingPlugin.default || existingPlugin;
      setState({ plugin: resolved, loading: false, error: null });
      return;
    }

    setState({ plugin: null, loading: true, error: null });

    // 2. Inject CSS if present
    if (styleUrl) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = styleUrl;
        link.id = `plugin-style-${config.id}`;
        document.head.appendChild(link);
    }

    // 3. Inject JS
    const script = document.createElement('script');
    script.src = mainScriptUrl;
    script.async = true;

    const handleLoad = () => {
      const loadedModule = (window as any)[globalName];
      if (loadedModule) {
        const resolved = loadedModule.default || loadedModule;
        setState({ plugin: resolved, loading: false, error: null });
      } else {
        setState({ 
          plugin: null, 
          loading: false, 
          error: `Script loaded but 'window.${globalName}' was not found. Check the plugin's build configuration.` 
        });
      }
    };

    const handleError = () => {
      setState({ 
        plugin: null, 
        loading: false, 
        error: `Failed to load plugin script: ${manifest.main}` 
      });
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      // We do not remove the script/link tags to allow caching and prevent rapid reload flicker
    };
  }, [config.id, config.manifest.main]); // Re-run only if ID or entry point changes

  return state;
};
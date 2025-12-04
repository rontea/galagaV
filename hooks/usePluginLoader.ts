import { useState, useEffect } from 'react';

interface PluginState {
  plugin: any | null;
  loading: boolean;
  error: string | null;
}

export const usePluginLoader = (url: string, globalName: string): PluginState => {
  const [state, setState] = useState<PluginState>({
    plugin: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!url || !globalName) return;

    // 1. Check if already loaded globally
    const existingPlugin = (window as any)[globalName];
    if (existingPlugin) {
      // Handle ES Module default export vs direct UMD export
      const resolved = existingPlugin.default || existingPlugin;
      setState({ plugin: resolved, loading: false, error: null });
      return;
    }

    setState({ plugin: null, loading: true, error: null });

    const script = document.createElement('script');
    script.src = url;
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
        error: `Failed to load plugin script from: ${url}` 
      });
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      // We generally do NOT remove the script tag to cache the code, 
      // but in a dev environment you might want to.
    };
  }, [url, globalName]);

  return state;
};
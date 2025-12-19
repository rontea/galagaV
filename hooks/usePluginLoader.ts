
import { useState, useEffect } from 'react';
import { PluginConfig } from '../types';

interface PluginState {
  plugin: any | null;
  loading: boolean;
  error: string | null;
}

// Global registry to track scripts being loaded to avoid race conditions
const loadingScripts = new Set<string>();

export const usePluginLoader = (config: PluginConfig): PluginState => {
  const [state, setState] = useState<PluginState>({
    plugin: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!config || !config.enabled) {
      setState({ plugin: null, loading: false, error: null });
      return;
    }

    const { manifest, files } = config;
    const globalName = manifest.globalVar;
    const mainScriptUrl = files[manifest.main];
    const styleUrl = manifest.style ? files[manifest.style] : null;

    if (!mainScriptUrl) {
        setState({ 
          plugin: null, 
          loading: false, 
          error: `Configuration Error: Entry file '${manifest.main}' not found in resources.` 
        });
        return;
    }

    // Check if already in global scope
    if ((window as any)[globalName]) {
      const loadedModule = (window as any)[globalName];
      const resolved = loadedModule.default || loadedModule;
      console.log(`[PLUGIN_BRIDGE] Module verified: window.${globalName}`);
      setState({ plugin: resolved, loading: false, error: null });
      return;
    }

    setState({ plugin: null, loading: true, error: null });

    // Stylesheet injection
    let link: HTMLLinkElement | null = null;
    if (styleUrl) {
        const linkId = `plugin-style-${config.id}`;
        let existingLink = document.getElementById(linkId) as HTMLLinkElement;
        if (!existingLink) {
            link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = styleUrl;
            link.id = linkId;
            document.head.appendChild(link);
        } else {
            link = existingLink;
        }
    }

    const scriptId = `plugin-script-${config.id}`;
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const handleLoad = () => {
      loadingScripts.delete(scriptId);
      const loadedModule = (window as any)[globalName];
      if (loadedModule) {
        const resolved = loadedModule.default || loadedModule;
        console.log(`[PLUGIN_BRIDGE] Successfully bridged module: window.${globalName}`);
        setState({ plugin: resolved, loading: false, error: null });
      } else {
        setState({ 
          plugin: null, 
          loading: false, 
          error: `Runtime Error: Global 'window.${globalName}' was not initialized. Check plugin's build configuration.` 
        });
      }
    };

    const handleError = () => {
      loadingScripts.delete(scriptId);
      setState({ 
        plugin: null, 
        loading: false, 
        error: `Network Error: Failed to execute entry point '${manifest.main}'.` 
      });
    };

    if (!script) {
        script = document.createElement('script');
        script.src = mainScriptUrl;
        script.async = true;
        script.id = scriptId;
        loadingScripts.add(scriptId);
        script.addEventListener('load', handleLoad);
        script.addEventListener('error', handleError);
        document.body.appendChild(script);
    } else {
        // If script tag exists but module not yet in window, wait for it
        if (loadingScripts.has(scriptId)) {
            script.addEventListener('load', handleLoad);
            script.addEventListener('error', handleError);
        } else {
            // Already loaded but maybe not assigned to state yet
            handleLoad();
        }
    }

    return () => {
      // We don't remove script tags for plugins as multiple components might be using them
      if (script) {
        script.removeEventListener('load', handleLoad);
        script.removeEventListener('error', handleError);
      }
    };
  }, [config.id, config.enabled, config.manifest.main]);

  return state;
};

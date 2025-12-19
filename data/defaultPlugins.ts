
import { PluginConfig, PluginManifest } from '../types';

export const PROFESSIONAL_MANIFEST: PluginManifest = {
  id: "com.galagav.theme.professional",
  name: "Professional System Theme",
  version: "1.1.0",
  description: "An enterprise-grade system theme that transforms the dashboard into a professional, blue-scale interface.",
  main: "index.js",
  style: "style.css",
  globalVar: "GalagaPlugin_ProfessionalTheme",
  type: "theme"
};

export const PROFESSIONAL_CSS = `
/* Professional / Enterprise Theme Overrides */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

body {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif !important;
  background-color: #F4F5F7 !important;
}
.dark body { background-color: #172B4D !important; }

/* Header */
header {
  background-color: #FFFFFF !important;
  border-bottom: 1px solid #DFE1E6 !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
}
.dark header {
  background-color: #091E42 !important;
  border-bottom: 1px solid #253858 !important;
}

/* Typography & Elements */
h1, h2, h3, h4, h5, h6, button, input, textarea, select {
  font-family: 'Roboto', sans-serif !important;
  letter-spacing: normal !important;
}

/* Buttons */
button {
  border-radius: 3px !important;
  font-weight: 500 !important;
  text-transform: none !important;
}

/* Primary Actions (Blue) */
button.bg-cyan-600, button.bg-emerald-600 {
  background-color: #0052CC !important;
}

/* Remove Arcade Effects */
.scanlines { display: none !important; }
.font-mono { font-family: 'Roboto', sans-serif !important; }
`;

export const PROFESSIONAL_JS = `
(function(global) {
  const React = global.React;
  
  const ProfessionalThemeInfo = () => {
    return React.createElement('div', { className: "p-8 flex flex-col items-center justify-center h-full text-center" },
      React.createElement('div', { className: "bg-[#DEEBFF] p-4 rounded-full mb-4" },
        React.createElement(global.Lucide.Briefcase, { size: 32, className: "text-[#0052CC]" })
      ),
      React.createElement('h1', { className: "text-2xl font-bold text-[#172B4D] mb-4" }, "Professional System Theme Active"),
      React.createElement('p', { className: "text-[#5E6C84] max-w-md" }, 
        "The system interface is using the Professional System Theme. This theme overrides global styles for a clean, sans-serif look with enterprise accents."
      )
    );
  };

  global.GalagaPlugin_ProfessionalTheme = {
    Component: ProfessionalThemeInfo
  };
})(window);
`;

export const getProfessionalPlugin = (): PluginConfig => {
  const toBase64 = (str: string) => btoa(unescape(encodeURIComponent(str)));

  const cssUri = `data:text/css;base64,${toBase64(PROFESSIONAL_CSS)}`;
  const jsUri = `data:text/javascript;base64,${toBase64(PROFESSIONAL_JS)}`;

  return {
    id: PROFESSIONAL_MANIFEST.id,
    enabled: false,
    manifest: PROFESSIONAL_MANIFEST,
    files: {
      "index.js": jsUri,
      "style.css": cssUri
    }
  };
};

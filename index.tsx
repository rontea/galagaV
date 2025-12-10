import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import * as LucideIcons from 'lucide-react';

// --- PLUGIN SYSTEM GLOBALS ---
// We expose these libraries to the 'window' object.
// External plugins (UMD) can access them via window.React, window.Lucide, etc.
// This allows plugins to be tiny (KB size) and share the exact same context as the main app.
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;
(window as any).Lucide = LucideIcons;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
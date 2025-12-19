
# 🔌 GalagaV Plugin Creation Guide

This guide details how to build and package custom React modules for the GalagaV ecosystem.

---

## 🏗️ 1. Architecture: The Shared Runtime
To keep plugins lightweight (usually <10KB) and prevent "Invalid Hook Call" errors, GalagaV uses a **Shared Runtime**.

**Crucial Rule**: Your plugin **must not** bundle `react`, `react-dom`, or `lucide-react`. Instead, it must use the instances provided by the host via the global `window` object.

| Library | Window Global |
| :--- | :--- |
| React | `window.React` |
| ReactDOM | `window.ReactDOM` |
| Lucide Icons | `window.Lucide` |

---

## 🛠️ 2. Quick Start (Boilerplate)

### A. `package.json`
Standard React/Vite setup, but we treat core libraries as `devDependencies`.

```json
{
  "name": "my-galaga-plugin",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "vite build"
  },
  "devDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "lucide-react": "^0.378.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```

### B. `vite.config.ts` (The Bridge)
This configuration ensures your plugin builds as a UMD module and correctly links to the host's globals.

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/index.tsx',
      name: 'GalagaPlugin_MyCustomTool', // MUST match manifest.globalVar
      fileName: () => `index.js`,
      formats: ['umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'lucide-react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'lucide-react': 'Lucide'
        }
      }
    }
  }
});
```

### C. `manifest.json`
Place this in your `public/` folder.

```json
{
  "id": "com.yourname.mytool",
  "name": "My Custom Tool",
  "version": "1.0.0",
  "description": "Adds a new management layer.",
  "main": "index.js",
  "style": "style.css",
  "globalVar": "GalagaPlugin_MyCustomTool",
  "type": "tool"
}
```

---

## 💻 3. Implementation (`src/index.tsx`)

Your component receives standard props to interact with the project data.

```tsx
import React from 'react';

const MyTool = ({ project, onSave, theme, onNotify }) => {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Hello from {project.name}</h1>
      <button 
        onClick={() => onNotify("Action Triggered!")}
        className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded"
      >
        Ping Host
      </button>
    </div>
  );
};

export default { Component: MyTool };
```

---

## 📦 4. Deployment Workflows

### Option A: Local Development (Folder Drop)
1.  Create a folder: `/plugins/my-custom-plugin/`.
2.  Place your `manifest.json`, built `index.js`, and `style.css` inside it.
3.  Restart GalagaV. The plugin will appear in **Settings > Plugins**.

### Option B: Distribution (Zip Upload)
1.  Build your project (`npm run build`).
2.  Go into your `dist/` folder.
3.  **Select the files** (not the folder) and compress them into `plugin.zip`.
4.  Upload via the dashboard UI.

---

## 🛡️ 5. Tips for Success
*   **CSS Scoping**: Use a unique class prefix for your plugin's styles to avoid leaking into the host's UI.
*   **Tailwind**: If you use Tailwind, ensure you prefix your classes or rely on standard CSS for overrides.
*   **Context**: Do not use `useContext` or other hooks that rely on a Provider *unless* you define that Provider inside your plugin's entry component.

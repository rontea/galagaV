# 🔌 GalagaV Plugin System (Zip Architecture)

> **Status:** Beta / Stable
> **Goal:** Enable dynamic loading of external React components via Zip Archives containing metadata and assets.

---

## 1. Architecture Overview

*   **Format:** Plugins are distributed as `.zip` files.
*   **Contents:**
    1.  `manifest.json` (Required): Metadata and entry points.
    2.  `index.js` (Required): The UMD compiled JavaScript.
    3.  `style.css` (Optional): External stylesheets.
*   **Shared Dependencies (CRITICAL):**
    *   The Host (GalagaV) exposes `React`, `ReactDOM`, and `Lucide` (icons) to the global window.
    *   **Plugins MUST NOT bundle these libraries.** They must treat them as external to keep file sizes small and avoid React context conflicts.

---

## 2. 🤖 INSTRUCTION FOR AI PLUGIN BUILDER

**Copy and paste the section below when you start a new chat/workspace to build a plugin.**

***

### SYSTEM PROMPT: Building a GalagaV Compatible Plugin (Zip Format)

You are an expert React Developer building a Plugin for the **GalagaV Host System**. 

**STRICT ARCHITECTURAL CONSTRAINTS:**

1.  **Build Target**: You are building a **Library (UMD)**, not an App.
2.  **External Dependencies**: You MUST NOT bundle `react`, `react-dom`, or `lucide-react`. 
    *   You must configure Vite/Rollup to treat them as `external`.
    *   You must rely on `window.React`, `window.ReactDOM`, and `window.Lucide`.
3.  **Output**: You must produce a `.zip` file containing `index.js` and `manifest.json`.

**STEP 1: `package.json`**
Ensure you have `vite` and `@vitejs/plugin-react`. You do NOT need css-injection plugins anymore as we support separate CSS files.

**STEP 2: `vite.config.ts` (CRITICAL)**
Use this configuration to exclude shared dependencies.

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/index.tsx',
      name: 'GalagaPlugin_MyPlugin', // This must match manifest.globalVar
      fileName: (format) => `index.js`,
      formats: ['umd']
    },
    rollupOptions: {
      // CRITICAL: Do not bundle these. The Host provides them.
      external: ['react', 'react-dom', 'lucide-react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'lucide-react': 'Lucide'
        },
        name: 'GalagaPlugin_MyPlugin', // MUST match manifest.globalVar
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css';
          return assetInfo.name;
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
```

**STEP 3: `manifest.json` (Required)**
Create this file in your `public/` folder so it ends up in dist.

```json
{
  "id": "com.example.myplugin",
  "name": "My Plugin Name",
  "version": "1.0.0",
  "description": "Does cool stuff",
  "main": "index.js",
  "style": "style.css", 
  "globalVar": "GalagaPlugin_MyPlugin",
  "type": "tool" 
}
```

**Plugin Types (`type`):**
*   `"tool"` (Default): Adds a new tab to the Project Detail view. The plugin's exported Component is rendered in that tab.
*   `"theme"`: Does NOT add a tab. The plugin's CSS/JS is loaded in the background to override global styles.

**STEP 4: Entry Point (`src/index.tsx`)**

```typescript
import MyComponent from './MyComponent';

// The Host expects a specific default export structure
const plugin = {
  Component: MyComponent
};

export default plugin;
```

**STEP 5: Packaging**
1. Run `npm run build`.
2. Go to `dist/`.
3. Zip the contents (ensure `manifest.json` and `index.js` are at the root of the zip).

***

# 📦 GalagaV Plugin Packaging Guide (v1.1)

This guide details the two standard workflows for integrating custom modules into the GalagaV Dashboard.

---

## 🏗️ 1. Project Structure
Your plugin source should be a standalone Vite/React project.

```text
/my-plugin-source
├── package.json
├── vite.config.ts
├── public/
│   └── manifest.json      <-- Required: Metadata
└── src/
    ├── index.tsx          <-- Required: Entry Point
    └── style.css          <-- Optional: Theme overrides
```

---

## 📄 2. The Manifest (`manifest.json`)
The manifest is the source of truth for the GalagaV loader. It must be at the **root** of your final package.

```json
{
  "id": "com.developer.mytool",
  "name": "Architect Pro",
  "version": "1.2.0",
  "description": "Advanced schema visualization tool.",
  "main": "index.js",
  "style": "style.css",
  "globalVar": "GalagaPlugin_ArchitectPro",
  "type": "tool"
}
```

- **globalVar**: The `UMD` library name. This **must** match the `name` property in your `vite.config.ts`.
- **type**: 
    - `"tool"`: (Default) Adds a dedicated tab to the project view.
    - `"theme"`: Runs globally in the background to apply CSS/Logic.

---

## 🛠️ 3. Development Workflow (Disk Discovery)
The fastest way to iterate is to use the **Local Disk Drop** method. GalagaV automatically scans the physical `/plugins` directory on boot.

1.  Create a folder: `[project_root]/plugins/my-dev-plugin/`.
2.  Copy your `manifest.json`, `index.js`, and `style.css` into this folder.
3.  **Discovery Priority**: The scanner looks for `manifest.json` in this order:
    1.  `/public/manifest.json`
    2.  `/dist/manifest.json`
    3.  `/manifest.json` (Root)
4.  Restart GalagaV or click **Sync with Disk** in the Settings menu.

---

## 📦 4. Distribution Workflow (The Zip Upload)
When sharing your plugin, you must create a "Flat Zip". 

### ⚠️ The Golden Rule: No Nesting
The `manifest.json` must be at the **absolute root** of the zip file. If the loader sees a folder inside the zip first, it will fail.

#### ✅ Correct Zip Structure:
```text
my-plugin.zip
├── manifest.json
├── index.js
└── style.css
```

#### ❌ Incorrect Zip Structure:
```text
my-plugin.zip
└── dist/                <-- Fails!
    ├── manifest.json
    └── index.js
```

### 🚀 Packaging Steps:
1.  Run `npm run build`.
2.  Navigate **into** your `dist/` folder.
3.  Select all files inside `dist/`.
4.  Right-click -> **Compress** / **Add to Archive**.
5.  Upload the resulting `.zip` via **Settings > Plugins > Upload**.

---

## ⚙️ 5. Build Config (`vite.config.ts`)
Use this boilerplate to ensure your filenames match the manifest and libraries aren't bundled.

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/index.tsx',
      name: 'GalagaPlugin_MyTool', // Must match manifest.globalVar
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
        },
        // Ensures style.css is not hashed
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) return 'style.css';
          return assetInfo.name || 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
});
```

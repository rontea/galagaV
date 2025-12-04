# 🔌 GalagaV Experimental Plugin System Architecture

> **Status:** Experimental / Draft
> **Goal:** Enable dynamic loading of external React components (Plugins) into the GalagaV Dashboard at runtime without rebuilding the main application.

---

## 1. Architecture Overview (Host vs. Remote)

To achieve a modular system where tools like a "Database Schema Creator" can be built separately and loaded in, we use a **Global Scope Implementation**.

*   **The Host (GalagaV)**:
    *   Exposes core dependencies (`React`, `ReactDOM`, `Lucide`) to the browser's `window` object.
    *   Provides a "Slot" (Tab) to render the plugin.
    *   Passes Project Data and Save functions to the plugin.
*   **The Remote (Plugin)**:
    *   Built as a **UMD/IIFE Library**.
    *   **Externalizes** React (does not bundle it).
    *   Consumes React from `window.React`.
    *   Exports a specific `PluginDefinition` object.

---

## 2. The Contract (Shared Types)

Any plugin built for GalagaV must adhere to this interface.

```typescript
// types.ts (Plugin Contract)

export interface PluginManifest {
  id: string;          // Unique ID (e.g., "schema-builder")
  name: string;        // Display Name (e.g., "DB Architect")
  version: string;     // Semantic Version
  description: string;
  icon: string;        // Lucide Icon Name
}

export interface PluginProps {
  // The Data
  project: any;        // The full Project object from GalagaV
  
  // Actions
  onSave: (updatedProject: any) => void; 
  onNotify: (message: string, type: 'success' | 'error') => void;
  
  // Environment
  theme: 'light' | 'dark';
}

export interface GalagaPlugin {
  manifest: PluginManifest;
  // The React Component to render
  Component: React.FC<PluginProps>;
}
```

---

## 3. Host Implementation Plan (GalagaV Side)

To support plugins, we will need to make the following changes to `GalagaV` in the next steps:

1.  **Expose Globals**: In `main.tsx` (or `index.tsx`), attach React to window.
    ```typescript
    import * as React from 'react';
    import * as ReactDOM from 'react-dom/client';
    
    (window as any).React = React;
    (window as any).ReactDOM = ReactDOM;
    ```
2.  **Plugin Registry**: Add a new key to `localStorage` (`galaga_plugins_registry`) to store the list of installed Plugin URLs.
3.  **Plugin Loader Hook**: Create a `usePlugin(url)` hook that dynamically injects a `<script>` tag, waits for it to load, and retrieves the plugin from `window.GalagaPlugins[id]`.
4.  **UI Update**: Add a "Plugins" tab to `ProjectDetail.tsx` that renders the active plugin.

---

## 4. 🤖 INSTRUCTION FOR AI PLUGIN BUILDER

**Copy and paste the section below when you start a new chat/workspace to build your Schema Creator. This ensures it generates code compatible with GalagaV.**

***

### SYSTEM PROMPT: Building a GalagaV Compatible Plugin

You are an expert React Developer building a Plugin for the **GalagaV Host System**. 
Your goal is to build a **"Database Schema Creator"** using `react-flow-renderer` (or `@xyflow/react`).

**STRICT ARCHITECTURAL CONSTRAINTS:**

1.  **Build Target**: You are building a **Library**, not a standalone App.
2.  **No Bundled React**: You MUST NOT bundle `react` or `react-dom`. You must expect them to exist on `window.React` and `window.ReactDOM`.
3.  **Entry Point**: Your entry file must export a default object matching the `GalagaPlugin` interface.

**FILE STRUCTURE & CONFIGURATION:**

**1. `vite.config.ts` (CRITICAL)**
You must use this exact configuration to ensure the Host can load your code:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/index.tsx', // Your entry point
      name: 'SchemaBuilderPlugin', // Variable name in window
      fileName: (format) => `schema-builder.${format}.js`,
      formats: ['umd'] // Must be UMD to access window.React global
    },
    rollupOptions: {
      // Do not bundle React. Use the Host's React.
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'React.jsx' // Handle JSX runtime
        },
        // IMPORTANT: This allows the Host to find your plugin on the window object
        name: 'GalagaPlugin_SchemaBuilder' 
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
```

**2. `src/index.tsx` (Entry Point)**
Your entry file must look like this:

```typescript
import SchemaBuilderComponent from './SchemaBuilderComponent';
import { Layout } from 'lucide-react';

// Define the Interface (for type safety, though not strictly required at runtime)
interface GalagaPlugin {
  manifest: {
    id: string;
    name: string;
    version: string;
    description: string;
    icon: string;
  };
  Component: any; // The React Component
}

const plugin: GalagaPlugin = {
  manifest: {
    id: 'schema-builder',
    name: 'Schema Architect',
    version: '1.0.0',
    description: 'Visual Drag & Drop Database Schema Creator',
    icon: 'Database' // Lucide icon name
  },
  Component: SchemaBuilderComponent
};

// Default export for usage
export default plugin;
```

**3. The Component (`src/SchemaBuilderComponent.tsx`)**
Your main component receives these props. Use them to read/write data.

```typescript
interface PluginProps {
  project: any; // The entire project object. Read project.description or project.content
  onSave: (updatedProject: any) => void; // Call this to save changes to the host
  theme: 'light' | 'dark'; // Use this for styling
}

const SchemaBuilderComponent: React.FC<PluginProps> = ({ project, onSave, theme }) => {
  // ... Your Drag and Drop Logic Here ...
  return (
    <div className="h-full w-full bg-slate-50">
       <h1>Schema for {project.name}</h1>
       {/* React Flow Implementation */}
    </div>
  )
}

export default SchemaBuilderComponent;
```

**Task for AI:**
Initialize the project structure, install `@xyflow/react` (React Flow), setup the `vite.config.ts` as specified above, and create a sophisticated `SchemaBuilderComponent` that allows creating tables, adding fields, and dragging them around.

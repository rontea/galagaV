# GalagaV - Project Dashboard

![Status](https://img.shields.io/badge/Status-Beta-blue) ![Version](https://img.shields.io/badge/Version-v0.9.0--beta-purple)

A modern, arcade-themed project management dashboard built with React, TypeScript, and Tailwind CSS. It combines retro aesthetics with powerful task management features, offering a unique "Gamified" interface for technical protocols and complex project planning.

![GalagaV Screenshot](https://via.placeholder.com/800x450?text=GalagaV+Dashboard+v0.9)

## 🚀 Features

### 📋 Advanced Task Management
-   **Timeline Visualization**: Vertical timeline with drag-and-drop reordering.
-   **Focused Workspaces (Tabs)**:
    -   **Task as Tab**: Open any complex task in its own dedicated tab for a distraction-free environment.
    -   **Read/Edit Modes**: Toggle between a clean "Document View" for reading requirements and an "Edit Mode" for making changes.
    -   **Deep Sub-Tasking**: Manage sub-tasks directly within the focused view.
-   **Drag & Drop Power**:
    -   **Nest**: Drag a main task onto another to instantly convert it into a sub-task.
    -   **Promote**: Drag a sub-task into the main timeline to make it a top-level task.
    -   **Sort**: Reorder sub-tasks freely within their parent or move them to other parents.
-   **Sub-Task Power**:
    -   **Numbering**: Auto-indexed sub-tasks (e.g., #1, #2).
    -   **Compact View**: Completed and Failed sub-tasks shrink to save space.
    -   **Auto-Edit**: New sub-tasks open immediately in edit mode for rapid entry.

### 🔌 Experimental Plugin System
GalagaV features a **Micro-Frontend Architecture** allowing you to load external tools dynamically.

-   **Runtime Loading**: Load external React components (built as UMD libraries) via URL without rebuilding the dashboard.
-   **Shared Context**: Plugins receive project data, theme settings, and save hooks automatically.
-   **Use Cases**: Add custom tools like "Database Schema Builders", "Kanban Boards", or "Analytics Charts" as tabs.

### 🎨 Customization & Visuals
-   **Visual States**:
    -   **Completed**: Minimalist green checkmark row.
    -   **Failed**: High-visibility red strikethrough row.
-   **Themes**: Light/Dark modes (CRT Scanline effect in Dark mode).
-   **Configurable**: Custom project icons, status colors, and categories.

### 💾 Data & Offline
-   **Data Portability**: Export projects to JSON and import them anywhere.
-   **Offline First**: Works completely offline using LocalStorage.
-   **Optional Integrations**:
    -   Google Gemini API (AI Context Generation)

---

## 🛠️ Installation & Setup

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or higher)
-   npm (comes with Node.js) or yarn

### 1. Download Source
Ensure you have all project files (including `package.json`, `vite.config.ts`, `index.html`, and the `src` folder) in a directory.

### 2. Install Dependencies
Open your terminal/command prompt in the project folder and run:

```bash
npm install
```

### 3. Run Locally
Start the development server:

```bash
npm run dev
```

The terminal will show a URL (usually `http://localhost:5173`). Open this in your browser.

---

## ⚙️ Changing the Port

If port `5173` is busy or you want to use a specific port (e.g., `3000`), you can do so in two ways:

### Method 1: Command Line (Temporary)
Run the dev command with the `--port` flag:

```bash
npm run dev -- --port 3000
```

### Method 2: Config File (Permanent)
1.  Open `vite.config.ts` in the root directory.
2.  Locate the `server` block.
3.  Change the `port` value.

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // <--- Change this number
    host: true,
  }
});
```

---

## 📦 Building for Production

To create a static version of the app (HTML/CSS/JS) that you can upload to any web host:

1.  Run the build command:
    ```bash
    npm run build
    ```

2.  The output files will be created in the `dist/` folder.
3.  Upload the contents of `dist/` to your web server (Netlify, Vercel, Apache, Nginx, etc.).

---

## 🔑 Environment Variables (Optional)

Create a `.env` file in the root directory to enable external services. The app will work fine without these.

```env
# Google Gemini API (For AI Features)
VITE_GEMINI_API_KEY=your_key
```

---

## 📂 Project Structure

```text
/
├── index.html              # Entry point (Vite)
├── src/
│   ├── components/         # React UI Components
│   │   ├── ProjectList.tsx    # Dashboard Home
│   │   ├── ProjectDetail.tsx  # Main Task Timeline View
│   │   ├── PluginView.tsx     # External Module Loader
│   │   ├── SettingsModal.tsx  # Global Config & Plugin Mgr
│   │   └── ...
│   ├── hooks/              # Custom React Hooks
│   │   └── usePluginLoader.ts # Dynamic Script Injection
│   ├── lib/                # Library Initializations
│   ├── services/           # External API Logic
│   │   └── geminiService.ts   # Google AI Integration
│   ├── types.ts            # TypeScript Interfaces
│   ├── App.tsx             # Main Routing/Layout Logic
│   └── index.css           # Tailwind Imports & Global Styles
├── tailwind.config.js      # Tailwind Configuration
└── vite.config.ts          # Vite Configuration
```

---

## 📄 License

MIT License. See LICENSE.md for details.
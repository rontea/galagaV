# GalagaV - Project Dashboard & Game

![Status](https://img.shields.io/badge/Status-In--Development-orange) ![Version](https://img.shields.io/badge/Version-v0.8.0--alpha-blue)

A modern, arcade-themed project management dashboard built with React, TypeScript, and Tailwind CSS. Originally designed as a dashboard for a Galaga Clone game, it has evolved into a fully functional task management tool with sub-tasks, history tracking, and JSON import/export capabilities.

![GalagaV Screenshot](https://via.placeholder.com/800x450?text=GalagaV+Dashboard)

## 🚀 Features

### 📋 Project & Task Management
-   **Timeline Visualization**: Vertical timeline with drag-and-drop reordering.
-   **Advanced Drag & Drop**:
    -   **Nest**: Drag a main task onto another to instantly convert it into a sub-task.
    -   **Promote**: Drag a sub-task into the main timeline to make it a top-level task.
    -   **Sort**: Reorder sub-tasks freely within their parent or move them to other parents.
-   **Sub-Task Power**:
    -   **Numbering**: Auto-indexed sub-tasks (e.g., #1, #2).
    -   **Compact View**: Completed and Failed sub-tasks shrink to save space.
    -   **Auto-Edit**: New sub-tasks open immediately in edit mode for rapid entry.
-   **Productivity Tools**:
    -   **Quick Notes**: Sticky-note style scratchpad attached to every task.
    -   **Duplicate**: One-click deep copy of tasks and their sub-structures.
    -   **Click-to-Edit**: Update task titles directly in the view mode.
    -   **Smart Copy**: Robust clipboard actions for task details.

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
    -   Firebase (High Scores & Profiles)
    -   Google Gemini API (AI Callsign Generation)

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

## ❓ Troubleshooting

If you run `npm run dev` and encounter issues, check the following:

**1. "command not found"**
*   Ensure Node.js is installed. Type `node -v` in your terminal. It should print a version number (e.g., `v18.x.x`).

**2. White Screen / Blank Page**
*   Check the browser console (F12 -> Console).
*   If you see errors about missing modules, ensure you ran `npm install` and that it completed without errors.

**3. "Address already in use"**
*   The port is taken. See the "Changing the Port" section above.

**4. Styles looking wrong?**
*   The app uses Tailwind CSS processed via PostCSS.
*   **Fix:** Ensure `npm install` installed `tailwindcss`, `postcss`, and `autoprefixer`. Restart the server (`Ctrl+C` then `npm run dev`) to ensure the CSS pipeline rebuilds correctly.

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

Create a `.env` file in the root directory to enable external services. The app will work fine without these, falling back to local simulation mode.

```env
# Firebase Configuration (For Global High Scores)
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
...

# Google Gemini API (For AI Callsign Generation)
VITE_GEMINI_API_KEY=your_key
```

---

## 📄 License

MIT License. See LICENSE.md for details.

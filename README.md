# GalagaV - Project Dashboard

![Status](https://img.shields.io/badge/Status-Beta-blue) ![Version](https://img.shields.io/badge/Version-v0.9.1--beta-purple)

A modern, arcade-themed project management dashboard built with React, TypeScript, and Tailwind CSS. It combines retro aesthetics with powerful task management features, offering a unique "Gamified" interface for technical protocols and complex project planning.

![GalagaV Screenshot](https://via.placeholder.com/800x450?text=GalagaV+Dashboard+v0.9)

## 🚀 Features

### 1. Project Management Dashboard
The dashboard is designed for managing complex technical protocols, game design documents, or general to-do lists with a sci-fi/arcade aesthetic.

*   **Project CRUD**:
    *   **Create**: Initialize new projects with a Name, Description, and System Prompt (Context).
    *   **Import/Export**: Full JSON export of project data (including all history and steps) and drag-and-drop import.
    *   **Archive**: Soft delete projects directly from the Dashboard or within the **Project Detail** view.
    *   **Hard Delete**: Permanently destroy projects.
    *   **Restore**: Recover projects from the archive.

*   **Global Configuration**:
    *   **Theme Toggle**: Switch between **Light Mode** (Clean) and **Dark Mode** (CRT/Arcade style).
    *   **Project Settings Modal**: Dedicated interface to manage Project Identity, Icons, Categories, and Statuses.
    *   **Config Portability**: **Export/Import** your Status and Category configurations as JSON to share setups between projects.
    *   **Custom Statuses & Categories**: Define semantic workflows (e.g., "QA", "Design", "Blocked") with custom colors and icons.

### 2. Advanced Task Management
The core value proposition is the timeline view for managing tasks.

*   **Timeline Visualization**:
    *   Vertical timeline with drag-and-drop reordering.
    *   **Visual Statuses**: Tasks change appearance based on status.
    *   **Compact Mode**:
        *   **Completed**: Shrinks to a minimalist green checkmark row.
        *   **Failed**: Shrinks to a high-visibility red strikethrough row.
    *   **Sub-Task Numbering**: Visual indexing (#1, #2) for nested requirements.
    *   **Text Overflow**: Automatic word wrapping for long URLs or code snippets.

*   **Drag & Drop Power**:
    *   **Reorder**: Drag main tasks to reorder them in the list.
    *   **Nesting**: Drag a main task *onto* another task to convert it into a **Sub-Task** automatically.
    *   **Sub-Task Flexibility**:
        *   **Sort**: Reorder sub-tasks within a list.
        *   **Move**: Drag a sub-task onto a different Main Task card to move it there.
        *   **Promote**: Drag a sub-task into the **gap** between Main Tasks to convert it into a top-level task.
        *   *Safety*: Prevents nesting into tasks currently in "Edit Mode" to avoid UI confusion.

*   **Task Operations**:
    *   **Quick Add**: One-click creation. New tasks start empty and **auto-focus** for immediate typing.
    *   **Click-to-Edit**: Edit Main Task titles directly in view mode without opening the full editor.
    *   **Focused Workspaces (Tabs)**: Open any complex task in its own dedicated tab (Read/Edit modes).
    *   **Sub-Tasks**:
        *   **Auto-Edit**: New sub-tasks automatically enter edit mode.
        *   **Copy Details**: Dedicated button to copy sub-task content.
        *   **Compact View**: Completed/Failed sub-tasks also shrink to save space.
    *   **Duplicate**: Clone a task (and all its sub-tasks) to create templates.
    *   **Smart Copy**: Instantly copy task content to clipboard (content only, clean format).
    *   **Quick Notes**: Sticky-note style scratchpad attached to every task for quick annotations.
    *   **History/Versioning**: Track previous attempts or iterations of a task.

### 3. Experimental Plugin System
GalagaV features a **Micro-Frontend Architecture** allowing you to load external tools dynamically.

*   **Runtime Loading**: Load external React components (built as UMD libraries) without rebuilding the dashboard.
*   **Local File Upload**: Drag and drop `.js` plugin builds directly into settings. They are converted to Data URIs and persisted locally.
*   **Shared Context**: Plugins receive project data, theme settings, and save hooks automatically.
*   **Use Cases**: Add custom tools like "Database Schema Builders", "Kanban Boards", or "Analytics Charts" as tabs.

---

## 🛠 Tech Stack

*   **Frontend Framework**: React 18
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS + PostCSS
*   **Icons**: Lucide React
*   **AI**: Google GenAI SDK (`@google/genai`)
*   **Backend (Optional)**: Firebase (Firestore, Auth)

---

## 💻 Installation (Local Development)

Follow these steps to run the project on your machine.

### Prerequisites
*   Node.js (v16 or higher)
*   npm or yarn

### Steps
1.  **Clone/Download**: Extract the project files to a local directory.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
4.  **Open Browser**: Navigate to `http://localhost:5173` (or the port shown in your terminal).

---

## ☁️ Deployment (Cloud)

Since this is a static application, it can be deployed to any static site hosting provider.

### Build Process
Before deploying, you must build the production assets.

1.  Run the build command:
    ```bash
    npm run build
    ```
2.  The output files will be created in the `dist/` folder.
3.  Upload the contents of `dist/` to your web server (Netlify, Vercel, Apache, Nginx, etc.).

---

## 🔑 Environment Configuration

The app works **100% offline** by default using LocalStorage. To enable Cloud High Scores and AI features, create a `.env` file in the root directory:

```env
# Google Gemini API (For AI Callsigns)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration (For Global High Scores)
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

*Note: The application gracefully handles missing keys by falling back to local simulation modes.*

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
│   │   ├── ProjectSettingsModal.tsx # Project Configuration
│   │   └── ...
│   ├── hooks/              # Custom React Hooks
│   │   └── usePluginLoader.ts # Dynamic Script Injection
│   ├── lib/                # Library Initializations (Firebase)
│   ├── services/           # External API Logic
│   │   ├── geminiService.ts   # Google AI Integration
│   │   └── scoreService.ts    # Score Persistence
│   ├── types.ts            # TypeScript Interfaces
│   ├── App.tsx             # Main Routing/Layout Logic
│   └── index.css           # Tailwind Imports & Global Styles
├── tailwind.config.js      # Tailwind Configuration
└── vite.config.ts          # Vite Configuration
```

---

## 📄 License

MIT License. See LICENSE.md for details.

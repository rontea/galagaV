# GalagaV - Developer & Feature Guide

## 🌟 Overview
GalagaV is a hybrid application combining a robust **Project Management Dashboard** with a fully playable **Arcade Space Shooter**. It is built with **React 18**, **TypeScript**, and **Tailwind CSS**, utilizing **Vite** for the build tooling. It supports offline persistence via LocalStorage and optional cloud features via Firebase and Google Gemini.

---

## 🚀 Features Breakdown

### 1. Project Management Dashboard
The dashboard is designed for managing complex technical protocols, game design documents, or general to-do lists with a sci-fi/arcade aesthetic.

*   **Project CRUD**:
    *   **Create**: Initialize new projects with a Name, Description, and System Prompt (Context).
    *   **Import/Export**: Full JSON export of project data (including all history and steps) and drag-and-drop import.
    *   **Soft Delete**: Move projects to an "Archived" state.
    *   **Hard Delete**: Permanently destroy projects.
    *   **Restore**: Recover projects from the archive.

*   **Global Configuration**:
    *   **Theme Toggle**: Switch between **Light Mode** (Clean) and **Dark Mode** (CRT/Arcade style).
    *   **Custom Icons**: Manage the library of available icons for projects and statuses.
    *   **Custom Statuses**: Define project-specific statuses (e.g., "In Progress", "Bug", "Deployed") with custom colors and icons.
    *   **Custom Categories**: Define semantic categories (e.g., "Frontend", "Backend", "Design") with auto-assigned colors.

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
    *   **Sub-Tasks**:
        *   **Auto-Edit**: New sub-tasks automatically enter edit mode.
        *   **Copy Details**: Dedicated button to copy sub-task content.
        *   **Compact View**: Completed/Failed sub-tasks also shrink to save space.
    *   **Duplicate**: Clone a task (and all its sub-tasks) to create templates.
    *   **Smart Copy**: Robust clipboard utility with fallback for older browsers/contexts.
    *   **Quick Notes**: Sticky-note style scratchpad attached to every task for quick annotations.
    *   **History/Versioning**: Track previous attempts or iterations of a task.

### 3. The Game (Galaga Clone)
A hidden or integrated "Break Time" feature.

*   **Engine**: Custom HTML5 Canvas rendering engine with a React hook-based game loop.
*   **Gameplay**:
    *   Player movement, shooting mechanics, and cooldowns.
    *   Enemy waves (Bees, Butterflies, Bosses) with dive patterns.
    *   Particle effects for explosions.
*   **Pilot Profiles**:
    *   **AI Integration**: Uses **Google Gemini API** to generate cool, 80s-style pilot callsigns based on the user's name.
    *   **Profile Storage**: Persists pilot name and theme preference.
*   **High Scores**:
    *   **Firebase Integration**: Stores global high scores in Firestore.
    *   **Offline Fallback**: Saves high scores to LocalStorage if Firebase is unreachable.

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
2.  This creates a `dist/` folder containing optimized HTML, CSS, and JavaScript.

### Hosting Options

#### 1. Vercel (Recommended)
*   Install Vercel CLI or connect your GitHub repo.
*   **Build Command**: `npm run build`
*   **Output Directory**: `dist`
*   **Environment Variables**: Add your `.env` variables in the Vercel dashboard.

#### 2. Netlify
*   Drag and drop the `dist/` folder into the Netlify dashboard, or connect GitHub.
*   **Build Command**: `npm run build`
*   **Publish Directory**: `dist`

#### 3. Firebase Hosting
*   Install Firebase tools: `npm install -g firebase-tools`
*   Login: `firebase login`
*   Initialize: `firebase init` (Select Hosting)
*   Public directory: `dist`
*   Configure as single-page app: **Yes**
*   Deploy: `npm run build && firebase deploy`

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
│   │   ├── GameCanvas.tsx     # Game Rendering Engine
│   │   └── ...
│   ├── hooks/              # Custom React Hooks
│   │   └── useGameLoop.ts     # Game Physics & Logic
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

# GalagaV - Project Dashboard

![Status](https://img.shields.io/badge/Status-Stable-emerald) ![Version](https://img.shields.io/badge/Version-v1.1.0-blue)

A professional, arcade-themed project management dashboard. GalagaV combines high-fidelity retro aesthetics with a robust, extensible SQLite-backed architecture.

---

## 🚀 Key Features

*   **Hybrid SQLite Storage**: Persistent database synced between physical disk (`/storage/`) and browser LocalStorage.
*   **Micro-Frontend Architecture**: Extend the dashboard with custom React modules.
*   **Advanced Timeline**: Manage complex nested protocols with a gamified CRT interface.
*   **AI Pilot Integration**: Google Gemini-powered callsign generation.

---

## 🔌 Extending the System (Plugins)

GalagaV is designed to be infinitely extensible. You can build your own tabs, themes, or management tools.

### Two Ways to Install:
1.  **Development**: Drop a plugin folder into the `/plugins` directory. The system will auto-detect it on the next boot.
2.  **Distribution**: Upload a `.zip` archive via the **System Settings > Plugins** menu.

👉 **[Read the Full Plugin Creation Guide](./PLUGIN_GUIDE.md)**

---

## 🛠 Tech Stack

*   **Core**: React 18, TypeScript, Vite.
*   **Database**: SQLite (via `sql.js`) with physical file persistence.
*   **Icons**: Lucide React.
*   **AI**: Google GenAI SDK.

---

## 💻 Installation

1.  **Clone & Install**:
    ```bash
    npm install
    ```
2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
3.  **Check Physical Storage**: A `/storage` folder will be created. Your database is `galagav.sqlite`.

---

## 📄 License
MIT License. See [LICENSE.md](./LICENSE.md) for details.

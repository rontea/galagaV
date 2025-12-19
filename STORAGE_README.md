# 🗄️ GalagaV Storage & Database Architecture

GalagaV uses a **Hybrid Persistence Layer** that combines the query power of SQL with the reliability of physical file storage.

---

## 🏛️ The "Whole App" Database
The entire application state—including your projects, tasks, high scores, and plugin source code—is stored in a single **SQLite Database**.

### 📍 Physical Locations
1.  **Server Disk (Primary)**: 
    *   **Path**: `/storage/galagav.sqlite`
    *   **Format**: Standard SQLite Binary File.
    *   **Benefit**: This file can be committed to Git or backed up manually. It survives browser cache clears.

2.  **Browser (Secondary/Sync)**: 
    *   **Key**: `galagav_sqlite_db` (LocalStorage)
    *   **Format**: Base64 Encoded String.
    *   **Benefit**: High-speed fallback if the dev server is unreachable or when running in a purely static environment.

---

## 🔄 Data Lifecycle
1.  **Boot**: App tries to fetch binary from `/__system/db-load` (reads from `/storage/`).
2.  **Fallback**: If server fetch fails, it pulls the Base64 string from `LocalStorage`.
3.  **Hydrate**: Data is loaded into the `sql.js` WebAssembly engine.
4.  **Active**: All operations happen in-memory for zero latency.
5.  **Sync (Dual-Write)**: Every change triggers:
    *   A snapshot save to `LocalStorage`.
    *   A background `POST` to the server to overwrite `/storage/galagav.sqlite`.

---

## 📋 Database Schema

*   **`projects`**: High-level mission metadata.
*   **`steps`**: Tasks and recursive sub-tasks.
*   **`global_config`**: System settings and **Plugin Repository** (code stored as JSON).
*   **`high_scores` & `user_profiles`**: Arcade and personal metadata.

---

## 🛠️ Data Management Tools

### Direct SQL Inspection
Since the database is now a physical file at `/storage/galagav.sqlite`, you can open it with any standard tool like **DB Browser for SQLite** or the **SQLite CLI**.

### Full System Reset
1.  Stop the dev server.
2.  Delete the `/storage/` folder.
3.  Clear browser LocalStorage.
4.  Restart the server.

### Manual Backup
Simply copy the `/storage/galagav.sqlite` file to a safe location.

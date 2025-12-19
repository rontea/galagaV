
import React, { useState, useEffect } from 'react';
import { Project, GlobalConfig, PluginConfig } from './types';
import ProjectList, { DEFAULT_PROJECT_KEYS, DEFAULT_STATUS_KEYS } from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import ConfirmModal from './components/ConfirmModal';
import PluginBootstrap from './components/PluginBootstrap';
import { getProfessionalPlugin } from './data/defaultPlugins';
import { initDB, getProjectsFromDB, saveProjectsToDB, getConfigFromDB, saveConfigToDB, migrateFromLocalStorage } from './lib/sqlite';
import { Loader2 } from 'lucide-react';

const STORAGE_KEY_INSTALLED_DEFAULTS = 'galaga_installed_default_plugins';
const STORAGE_KEY_BLOCKED_PLUGINS = 'galaga_blocked_plugins';

const DEFAULT_PROJECT: Project = {
  id: 'proj_galagav_default',
  name: 'GalagaV Dashboard',
  description: 'A professional workspace for managing technical protocols and development roadmaps.',
  systemPrompt: 'ROLE: Senior Product Manager & Technical Architect.\nGOAL: Organize and track complex system requirements and deployment cycles.',
  icon: 'Layout',
  steps: [
    {
      id: 'step_1',
      title: 'Initialize Dashboard',
      category: 'frontend',
      status: 'completed',
      content: 'Core architecture and state management initialized.',
      createdAt: Date.now()
    },
    {
      id: 'step_2',
      title: 'Plugin System Integration',
      category: 'backend',
      status: 'in-progress',
      content: 'Expanding virtual file system capabilities for external module loading.',
      createdAt: Date.now()
    }
  ]
};

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  isDanger: boolean;
  confirmLabel?: string;
}

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initMessage, setInitMessage] = useState('Initializing Core Database...');
  
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>({
    projectIcons: DEFAULT_PROJECT_KEYS,
    statusIcons: DEFAULT_STATUS_KEYS,
    plugins: [],
    theme: 'dark'
  });

  const [confirmModal, setConfirmModal] = useState<ConfirmState | null>(null);

  const syncPluginsFromDisk = async (currentConfig: GlobalConfig): Promise<GlobalConfig> => {
    try {
      console.log("[PLUGIN_DISCOVERY] Scanning /plugins directory...");
      const response = await fetch('/__system/list-plugins');
      if (!response.ok) return currentConfig;

      const diskPlugins: PluginConfig[] = await response.json();
      if (!diskPlugins || diskPlugins.length === 0) return currentConfig;

      const updatedPlugins = [...(currentConfig.plugins || [])];
      let changes = false;

      diskPlugins.forEach(diskPlugin => {
        const existingIdx = updatedPlugins.findIndex(p => p.id === diskPlugin.id);
        if (existingIdx === -1) {
          console.log(`[PLUGIN_DISCOVERY] New plugin detected: ${diskPlugin.id}`);
          updatedPlugins.push({ ...diskPlugin, enabled: true });
          changes = true;
        } else {
          const existing = updatedPlugins[existingIdx];
          updatedPlugins[existingIdx] = {
            ...diskPlugin,
            enabled: existing.enabled 
          };
          changes = true;
        }
      });

      return changes ? { ...currentConfig, plugins: updatedPlugins } : currentConfig;
    } catch (e) {
      console.warn("[PLUGIN_DISCOVERY] Disk sync unavailable (static/production mode).");
      return currentConfig;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const db = await initDB();
        
        const existingProjects = getProjectsFromDB();
        const existingConfig = getConfigFromDB();

        if (existingProjects.length === 0 && !existingConfig) {
           console.log("[SQLITE] New database detected. Checking for migration...");
           migrateFromLocalStorage(db);
        }

        const loadedProjects = getProjectsFromDB();
        if (loadedProjects.length > 0) {
          setProjects(loadedProjects);
        } else {
          setProjects([DEFAULT_PROJECT]);
          saveProjectsToDB([DEFAULT_PROJECT]);
        }

        let loadedConfig = getConfigFromDB();
        if (!loadedConfig) {
          loadedConfig = {
            projectIcons: DEFAULT_PROJECT_KEYS,
            statusIcons: DEFAULT_STATUS_KEYS,
            plugins: [],
            theme: 'dark'
          };
        }

        setInitMessage("Discovering Plugins...");
        loadedConfig = await syncPluginsFromDisk(loadedConfig);

        setGlobalConfig(loadedConfig);
      } catch (e) {
        console.warn("Failed to initialize system database", e);
        setProjects([DEFAULT_PROJECT]);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    saveProjectsToDB(projects);
  }, [projects, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    saveConfigToDB(globalConfig);
  }, [globalConfig, isInitialized]);

  const handleUpdateGlobalConfig = (newConfig: GlobalConfig) => {
    setGlobalConfig(newConfig);
  };

  const handleCreateProject = (name: string, description: string, systemPrompt: string) => {
    const newProject: Project = {
      ...DEFAULT_PROJECT,
      id: `proj_${Date.now()}`,
      name,
      description,
      systemPrompt: systemPrompt || DEFAULT_PROJECT.systemPrompt,
      icon: 'Layout',
      steps: []
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
  };

  const handleImportProject = (importedProject: Project) => {
    const uniqueProject = {
      ...importedProject,
      id: `proj_${Date.now()}_imported`,
      name: `${importedProject.name} (Imported)`
    };
    setProjects(prev => [...prev, uniqueProject]);
  };

  const handleSoftDeleteProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    const projectName = project ? project.name : 'this project';

    setConfirmModal({
      isOpen: true,
      title: "Archive Project?",
      message: `Are you sure you want to archive "${projectName}"?`,
      isDanger: false,
      confirmLabel: "Archive",
      onConfirm: () => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, deletedAt: Date.now() } : p));
        if (activeProjectId === id) setActiveProjectId(null);
        setConfirmModal(null);
      }
    });
  };

  const handleRestoreProject = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, deletedAt: undefined } : p));
  };

  const handlePermanentDeleteProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    const projectName = project ? project.name : 'this project';

    setConfirmModal({
      isOpen: true,
      title: "Delete Permanently?",
      message: `WARNING: This will permanently destroy "${projectName}".`,
      isDanger: true,
      confirmLabel: "Destroy",
      onConfirm: () => {
        setProjects(prev => prev.filter(p => p.id !== id));
        setConfirmModal(null);
      }
    });
  };

  const handleClearArchive = () => {
    setConfirmModal({
      isOpen: true,
      title: "Clear All Archives?",
      message: "WARNING: This will permanently delete ALL archived projects.",
      isDanger: true,
      confirmLabel: "Clear All",
      onConfirm: () => {
        setProjects(prev => prev.filter(p => !p.deletedAt));
        setConfirmModal(null);
      }
    });
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#050505] text-white font-mono">
        <Loader2 className="animate-spin text-cyan-500 mb-4" size={48} />
        <h1 className="text-xl tracking-widest uppercase">{initMessage}</h1>
        <p className="text-slate-500 mt-2 text-xs">Syncing SQLite state with physical storage...</p>
      </div>
    );
  }

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className={globalConfig.theme === 'dark' ? 'dark' : ''}>
      <PluginBootstrap globalConfig={globalConfig} />
      <div className="h-screen overflow-y-auto bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
        {activeProject ? (
          <ProjectDetail 
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onBack={() => setActiveProjectId(null)}
            onDeleteProject={handleSoftDeleteProject}
            globalConfig={globalConfig}
            onUpdateGlobalConfig={handleUpdateGlobalConfig}
          />
        ) : (
          <ProjectList 
            projects={projects}
            onCreateProject={handleCreateProject}
            onImportProject={handleImportProject}
            onSelectProject={setActiveProjectId}
            onDeleteProject={handleSoftDeleteProject}
            onRestoreProject={handleRestoreProject}
            onPermanentDeleteProject={handlePermanentDeleteProject}
            onClearArchive={handleClearArchive}
            globalConfig={globalConfig}
            onUpdateGlobalConfig={handleUpdateGlobalConfig}
          />
        )}

        {confirmModal && (
          <ConfirmModal 
            isOpen={confirmModal.isOpen}
            title={confirmModal.title}
            message={confirmModal.message}
            isDanger={confirmModal.isDanger}
            confirmLabel={confirmModal.confirmLabel}
            onConfirm={confirmModal.onConfirm}
            onCancel={() => setConfirmModal(null)}
          />
        )}
      </div>
    </div>
  );
};

export default App;

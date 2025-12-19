
import React from 'react';
import { Project } from './types';

interface PluginProps {
  project: Project;
  onSave: (updatedProject: Project) => void;
  theme: 'light' | 'dark';
  onNotify: (msg: string) => void;
}

/**
 * Professional System Theme Component
 * Since this is a 'theme' type plugin, this component is used primarily for 
 * background logic or as an informational block in the plugin settings.
 */
const ProfessionalTheme: React.FC<PluginProps> = ({ theme, onNotify }) => {
  React.useEffect(() => {
    onNotify("Professional System Theme Engine Initialized.");
  }, []);

  return (
    <div className="p-12 flex flex-col items-center justify-center text-center font-sans h-full bg-[#F4F5F7] dark:bg-[#091E42] text-[#172B4D] dark:text-[#EBECF0]">
      <div className="w-16 h-16 bg-[#0052CC] rounded-full flex items-center justify-center text-white mb-6 shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-2">Professional System Theme</h1>
      <p className="text-[#5E6C84] dark:text-[#97A0AF] max-w-sm text-sm leading-relaxed">
        The system-wide enterprise design language is active. Global styles, typography, and color palettes have been overridden to meet professional protocol standards.
      </p>
      
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="px-4 py-2 bg-white dark:bg-black/20 border border-[#DFE1E6] dark:border-[#253858] rounded text-[10px] font-mono font-bold uppercase tracking-tighter">
          Mode: {theme}
        </div>
        <div className="px-4 py-2 bg-white dark:bg-black/20 border border-[#DFE1E6] dark:border-[#253858] rounded text-[10px] font-mono font-bold uppercase tracking-tighter">
          Version: 1.1.0_SYS
        </div>
      </div>
    </div>
  );
};

const plugin = {
  Component: ProfessionalTheme
};

export default plugin;

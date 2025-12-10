import React from 'react';

const JiraThemeInfo: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#172B4D] mb-4">Professional Theme Active</h1>
      <p className="text-[#5E6C84]">
        The system interface has been updated to use the Enterprise Design System.
        This theme overrides global styles to provide a cleaner, sans-serif look with professional blue accents.
      </p>
    </div>
  );
};

const plugin = {
  Component: JiraThemeInfo
};

export default plugin;
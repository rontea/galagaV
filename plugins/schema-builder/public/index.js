
(function(global) {
  const React = global.React;
  const { useState, useRef, useEffect, useMemo } = React;
  const Lucide = global.Lucide;

  const SCHEMA_STEP_ID = 'architect_schema_data';

  const SchemaBuilder = ({ project, onSave, theme, onNotify }) => {
    const schemaStep = (project.steps || []).find(s => s.id === SCHEMA_STEP_ID);
    const [viewMode, setViewMode] = useState('visual');
    const [selectedTableId, setSelectedTableId] = useState(null);

    const initialData = useMemo(() => {
      if (schemaStep && schemaStep.content) {
        try { return JSON.parse(schemaStep.content); } catch (e) { return { tables: [], relationships: [] }; }
      }
      return { tables: [], relationships: [] };
    }, [schemaStep]);

    const [data, setData] = useState(initialData);

    useEffect(() => {
      if (JSON.stringify(data) === JSON.stringify(initialData)) return;
      const timer = setTimeout(() => {
        const updatedSteps = [...(project.steps || [])];
        const idx = updatedSteps.findIndex(s => s.id === SCHEMA_STEP_ID);
        const newStep = {
          id: SCHEMA_STEP_ID, title: 'Architect Schema Store', category: 'backend', status: 'completed', content: JSON.stringify(data), createdAt: Date.now()
        };
        if (idx > -1) updatedSteps[idx] = newStep;
        else updatedSteps.push(newStep);
        onSave({ ...project, steps: updatedSteps });
      }, 1000);
      return () => clearTimeout(timer);
    }, [data, project, onSave]);

    const addTable = () => {
      const id = 'tbl_' + Date.now();
      const newTable = {
        id, name: 'NEW_ENTITY', x: 50 + data.tables.length * 30, y: 50 + data.tables.length * 30,
        columns: [{ id: 'col_' + Date.now(), name: 'id', type: 'UUID', isPrimary: true }]
      };
      setData(prev => ({ ...prev, tables: [...prev.tables, newTable] }));
      setSelectedTableId(id);
    };

    return React.createElement('div', { className: "flex h-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white" },
      React.createElement('div', { className: "w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4" },
        React.createElement('h2', { className: "text-xs font-bold uppercase tracking-widest text-slate-400 mb-6" }, "Schema Designer"),
        React.createElement('button', { 
            onClick: addTable,
            className: "w-full py-2 bg-cyan-600 text-white rounded text-xs font-bold uppercase mb-4 shadow-lg shadow-cyan-900/20 active:scale-95 transition-all"
        }, "+ Add Entity"),
        selectedTableId && React.createElement('div', { className: "pt-4 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2" },
            React.createElement('label', { className: "text-[10px] uppercase font-bold text-slate-500 mb-2 block" }, "Entity Name"),
            React.createElement('input', { 
                value: data.tables.find(t => t.id === selectedTableId)?.name || '', 
                onChange: e => setData(prev => ({...prev, tables: prev.tables.map(t => t.id === selectedTableId ? {...t, name: e.target.value.toUpperCase()} : t)})),
                className: "w-full p-2 bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-800 rounded text-sm outline-none focus:border-cyan-500 transition-colors"
            })
        )
      ),
      React.createElement('div', { className: "flex-1 relative overflow-auto p-10" },
        data.tables.map(table => React.createElement('div', {
            key: table.id,
            onClick: () => setSelectedTableId(table.id),
            style: { left: table.x, top: table.y, position: 'absolute' },
            className: `w-48 bg-white dark:bg-slate-900 border-2 rounded-lg shadow-xl cursor-pointer transition-all ${selectedTableId === table.id ? 'border-cyan-500 shadow-cyan-900/40 scale-105' : 'border-slate-200 dark:border-slate-800'}`
        },
            React.createElement('div', { className: "p-2 bg-slate-50 dark:bg-slate-800 border-b border-inherit font-bold text-[10px] uppercase tracking-wider" }, table.name),
            React.createElement('div', { className: "p-2 space-y-1" }, 
                table.columns.map(c => React.createElement('div', { key: c.id, className: "text-[10px] font-mono flex justify-between" }, 
                    React.createElement('span', null, c.name),
                    React.createElement('span', { className: "text-slate-400" }, c.type)
                ))
            )
        ))
      )
    );
  };

  global.GalagaPlugin_SchemaBuilder = { Component: SchemaBuilder };
})(window);

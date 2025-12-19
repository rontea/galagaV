
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, Database, Key, Trash2, Copy, Check, Upload, 
  MousePointer2, Settings2, X, ChevronDown, Save, 
  Download, Zap, Settings, ArrowLeft, RefreshCw, Layout
} from 'lucide-react';
import { Project, SchemaData, Table, Column, Step } from './types';

interface PluginProps {
  project: Project;
  onSave: (updatedProject: Project) => void;
  theme: 'light' | 'dark';
  onNotify: (msg: string) => void;
}

const SCHEMA_STEP_ID = 'architect_schema_data';

const SchemaBuilder: React.FC<PluginProps> = ({ project, onSave, theme, onNotify }) => {
  const schemaStep = (project.steps || []).find(s => s.id === SCHEMA_STEP_ID);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<{tableId: string, colId: string} | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const initialData: SchemaData = useMemo(() => {
    if (schemaStep?.content) {
      try {
        return JSON.parse(schemaStep.content);
      } catch (e) {
        return { tables: [], relationships: [] };
      }
    }
    return { tables: [], relationships: [] };
  }, [schemaStep]);

  const [data, setData] = useState<SchemaData>(initialData);
  const [draggedTableId, setDraggedTableId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (JSON.stringify(data) === JSON.stringify(initialData)) return;
    const timer = setTimeout(() => {
      const updatedSteps = [...(project.steps || [])];
      const idx = updatedSteps.findIndex(s => s.id === SCHEMA_STEP_ID);
      const newStep: Step = {
        id: SCHEMA_STEP_ID,
        title: 'Architect Schema Store',
        category: 'backend',
        status: 'completed',
        content: JSON.stringify(data),
        createdAt: Date.now()
      };
      if (idx > -1) updatedSteps[idx] = newStep;
      else updatedSteps.push(newStep);
      onSave({ ...project, steps: updatedSteps });
    }, 1500);
    return () => clearTimeout(timer);
  }, [data, project, onSave]);

  const addTable = () => {
    const id = `tbl_${Date.now()}`;
    const newTable: Table = {
      id,
      name: `NEW_ENTITY`,
      x: 100 + (data.tables.length * 40),
      y: 100 + (data.tables.length * 40),
      columns: [
        { id: `col_${Date.now()}`, name: 'id', type: 'UUID', isPrimary: true, isForeignKey: false, isNullable: false, isConnectable: true, isArray: false }
      ]
    };
    setData(prev => ({ ...prev, tables: [...prev.tables, newTable] }));
    setSelectedTableId(id);
    setSelectedColumnId(null);
  };

  const deleteTable = (id: string) => {
    if (!confirm("Destroy this table protocol?")) return;
    setData(prev => ({
      ...prev,
      tables: prev.tables.filter(t => t.id !== id)
    }));
    if (selectedTableId === id) setSelectedTableId(null);
    if (selectedColumnId?.tableId === id) setSelectedColumnId(null);
  };

  const addColumn = (tableId: string) => {
    const colId = `col_${Date.now()}`;
    setData(prev => ({
      ...prev,
      tables: prev.tables.map(t => t.id === tableId ? {
        ...t,
        columns: [...t.columns, { 
          id: colId, 
          name: 'new_field', 
          type: 'VARCHAR', 
          isPrimary: false, 
          isForeignKey: false, 
          isNullable: true, 
          isConnectable: false,
          isArray: false
        }]
      } : t)
    }));
    setSelectedColumnId({ tableId, colId });
    setSelectedTableId(null);
  };

  const updateColumn = (tableId: string, colId: string, updates: Partial<Column>) => {
    setData(prev => ({
      ...prev,
      tables: prev.tables.map(t => t.id === tableId ? {
        ...t,
        columns: t.columns.map(c => c.id === colId ? { ...c, ...updates } : c)
      } : t)
    }));
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `schema-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.tables) setData(parsed);
      } catch (err) { onNotify("IMPORT_ERROR: File structure mismatch."); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleMouseDown = (e: React.MouseEvent, table: Table) => {
    if ((e.target as HTMLElement).closest('.btn-action')) return;
    setDraggedTableId(table.id);
    setSelectedTableId(table.id);
    setSelectedColumnId(null);
    setDragOffset({ x: e.clientX - table.x, y: e.clientY - table.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedTableId) return;
    setData(prev => ({
      ...prev,
      tables: prev.tables.map(t => t.id === draggedTableId ? { ...t, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } : t)
    }));
  };

  const selectedColumn = useMemo(() => {
    if (!selectedColumnId) return null;
    const table = data.tables.find(t => t.id === selectedColumnId.tableId);
    return table?.columns.find(c => c.id === selectedColumnId.colId) || null;
  }, [selectedColumnId, data.tables]);

  return (
    <div className="flex h-full bg-slate-50 dark:bg-[#050505] overflow-hidden font-sans">
      {/* SIDEBAR PANEL */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-[#020617] z-20 shadow-xl sidebar-panel">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="sidebar-header flex items-center gap-2">
              <Zap size={14} className="text-cyan-500" />
              BLUEPRINT_v1.0
            </h2>
            <div className="flex bg-slate-100 dark:bg-slate-900/50 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                <button 
                  onClick={() => setViewMode('visual')} 
                  className={`px-3 py-1.5 text-[9px] font-bold uppercase rounded-md transition-all ${viewMode === 'visual' ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Visual
                </button>
                <button 
                  onClick={() => setViewMode('code')} 
                  className={`px-3 py-1.5 text-[9px] font-bold uppercase rounded-md transition-all ${viewMode === 'code' ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  JSON
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {!selectedTableId && !selectedColumnId && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900/20 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                      <MousePointer2 size={32} className="text-slate-300 dark:text-slate-700" />
                    </div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Select Entity</p>
                </div>
            )}

            {selectedTableId && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-2 font-mono uppercase tracking-wider">
                           <Database size={14} /> Entity Config
                        </h3>
                        <button onClick={() => setSelectedTableId(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={16}/></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[9px] font-bold uppercase text-slate-500 mb-2 block tracking-widest">Entity Name</label>
                            <input 
                                className="w-full sidebar-input font-bold"
                                value={data.tables.find(t => t.id === selectedTableId)?.name || ''}
                                onChange={(e) => setData(prev => ({
                                    ...prev,
                                    tables: prev.tables.map(t => t.id === selectedTableId ? {...t, name: e.target.value.toUpperCase()} : t)
                                }))}
                                placeholder="ENTITY_NAME"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => addColumn(selectedTableId)} className="flex items-center justify-center gap-2 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
                                <Plus size={14} /> Add Field
                            </button>
                            <button onClick={() => deleteTable(selectedTableId)} className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedColumnId && selectedColumn && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-mono uppercase tracking-wider">
                           <Settings2 size={14} /> Attr Config
                        </h3>
                        <button onClick={() => setSelectedColumnId(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={16}/></button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-[9px] font-bold uppercase text-slate-500 mb-2 block tracking-widest">Field Name</label>
                            <input 
                                className="w-full sidebar-input font-mono"
                                value={selectedColumn.name}
                                onChange={(e) => updateColumn(selectedColumnId.tableId, selectedColumnId.colId, { name: e.target.value.toLowerCase() })}
                            />
                        </div>

                        <div>
                            <label className="text-[9px] font-bold uppercase text-slate-500 mb-2 block tracking-widest">Type</label>
                            <div className="relative">
                                <select 
                                    className="w-full appearance-none sidebar-input font-mono cursor-pointer pr-10"
                                    value={selectedColumn.type}
                                    onChange={(e) => updateColumn(selectedColumnId.tableId, selectedColumnId.colId, { type: e.target.value })}
                                >
                                    <option value="UUID">UUID</option>
                                    <option value="INT">INT</option>
                                    <option value="VARCHAR">VARCHAR</option>
                                    <option value="TEXT">TEXT</option>
                                    <option value="BOOLEAN">BOOLEAN</option>
                                    <option value="DATETIME">DATETIME</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                             <button 
                                onClick={() => updateColumn(selectedColumnId.tableId, selectedColumnId.colId, { isPrimary: !selectedColumn.isPrimary })}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-xs font-bold transition-all ${selectedColumn.isPrimary ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-500 text-amber-700 dark:text-amber-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'}`}
                             >
                                <div className="flex items-center gap-2 uppercase tracking-wide"><Key size={14}/> PK</div>
                                {selectedColumn.isPrimary && <Check size={14} />}
                             </button>
                             <button 
                                onClick={() => updateColumn(selectedColumnId.tableId, selectedColumnId.colId, { isNullable: !selectedColumn.isNullable })}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-xs font-bold transition-all ${!selectedColumn.isNullable ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-700 dark:text-emerald-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'}`}
                             >
                                <div className="flex items-center gap-2 uppercase tracking-wide">NOT_NULL</div>
                                {!selectedColumn.isNullable && <Check size={14} />}
                             </button>
                        </div>
                        
                        <button 
                            onClick={() => {
                                setData(prev => ({
                                    ...prev,
                                    tables: prev.tables.map(t => t.id === selectedColumnId.tableId ? {...t, columns: t.columns.filter(c => c.id !== selectedColumnId.colId)} : t)
                                }));
                                setSelectedColumnId(null);
                            }}
                            className="w-full py-2.5 text-rose-500 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                        >
                            Purge Attr
                        </button>
                    </div>
                </div>
            )}
        </div>
        
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col gap-2">
             <button 
                onClick={addTable}
                className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-cyan-900/20 active:scale-[0.98]"
             >
                <Plus size={18}/> New Entity
             </button>
             
             <div className="grid grid-cols-2 gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all shadow-sm">
                    <Upload size={14}/> Import
                </button>
                <button onClick={handleDownloadJSON} className="flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all shadow-sm">
                    <Download size={14}/> Export
                </button>
             </div>
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="hidden" />
        </div>
      </div>

      {/* CANVAS AREA */}
      <div className="flex-1 relative overflow-hidden">
        {viewMode === 'code' ? (
            <div className="p-10 h-full overflow-auto custom-scrollbar bg-slate-50 dark:bg-[#050505]">
                <div className="max-w-3xl mx-auto relative">
                    <pre className="p-10 bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono leading-relaxed text-slate-700 dark:text-cyan-500/80 shadow-xl overflow-x-auto">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                    <button 
                        onClick={() => { navigator.clipboard.writeText(JSON.stringify(data, null, 2)); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }}
                        className="absolute top-6 right-6 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-cyan-500 transition-all shadow-sm"
                    >
                        {isCopied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                    </button>
                </div>
            </div>
        ) : (
            <div 
                ref={canvasRef}
                className="w-full h-full schema-canvas custom-scrollbar"
                onMouseMove={handleMouseMove}
                onMouseUp={() => setDraggedTableId(null)}
            >
                {data.tables.map((table) => (
                    <div 
                        key={table.id}
                        onMouseDown={(e) => handleMouseDown(e, table)}
                        style={{ left: table.x, top: table.y }}
                        className={`schema-table ${selectedTableId === table.id ? 'active' : ''}`}
                    >
                        <div className="table-header">
                            <h3 className="table-title">{table.name}</h3>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedTableId(table.id); setSelectedColumnId(null); }}
                                className="btn-action text-white/50 hover:text-white transition-colors"
                            >
                                <Settings size={14} />
                            </button>
                        </div>

                        <div className="column-list">
                            {table.columns.length === 0 ? (
                                <div className="p-8 text-center text-[10px] text-slate-400 font-bold tracking-widest">NO_ATTRIBUTES</div>
                            ) : (
                                table.columns.map(col => {
                                    const isSelected = selectedColumnId?.colId === col.id;
                                    return (
                                        <div 
                                            key={col.id} 
                                            className={`column-row ${isSelected ? 'selected' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); setSelectedColumnId({tableId: table.id, colId: col.id}); setSelectedTableId(null); }}
                                        >
                                            <div className="flex items-center min-w-0">
                                                {col.isPrimary && <span className="indicator-pk"><Key size={12} /></span>}
                                                <span className="font-bold truncate">{col.name}</span>
                                                {!col.isNullable && <span className="indicator-nn" title="NOT NULL">•</span>}
                                            </div>
                                            <div className="type-metadata ml-4">
                                                {col.type}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        <div className="table-footer">
                            <button 
                                onClick={(e) => { e.stopPropagation(); addColumn(table.id); }}
                                className="btn-add-field"
                            >
                                <Plus size={14}/> Add Field
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

const plugin = { Component: SchemaBuilder };
export default plugin;

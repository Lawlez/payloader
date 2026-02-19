import React from 'react';
import { Shield, Image, Zap, Sparkles, FileWarning, Dna, FileSpreadsheet, Archive } from 'lucide-react';
import { GeneratorCategory } from '../types';

interface SidebarProps {
  selected: GeneratorCategory;
  onSelect: (c: GeneratorCategory) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selected, onSelect }) => {
  const menuItems = [
    { id: GeneratorCategory.STANDARD, label: 'Standard Formats', icon: Image, desc: 'Valid JPG, PNG, WEBP, BMP' },
    { id: GeneratorCategory.SECURITY, label: 'Security Payloads', icon: Shield, desc: 'XSS, XXE, Web Shells' },
    { id: GeneratorCategory.DATA, label: 'Data Injection', icon: FileSpreadsheet, desc: 'CSV Injection, JSON Attacks' },
    { id: GeneratorCategory.ARCHIVE, label: 'Archives', icon: Archive, desc: 'Zip Slip, Zip Bombs' },
    { id: GeneratorCategory.ANOMALY, label: 'Anomalies', icon: FileWarning, desc: 'Corrupted, Fake Headers, EICAR' },
    { id: GeneratorCategory.AI, label: 'AI Generator', icon: Sparkles, desc: 'Generate with Gemini' },
    { id: GeneratorCategory.CHAOS, label: 'Chaos Mode', icon: Dna, desc: 'Randomizer & Shuffler' },
  ];

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <Zap className="w-8 h-8 text-indigo-500" />
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Payloader</h1>
          <p className="text-xs text-slate-500">Pentesting Artifacts</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = selected === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-start p-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-600/10 border border-indigo-600/50' 
                  : 'hover:bg-slate-800 border border-transparent'
              }`}
            >
              <div className={`p-2 rounded-md mr-3 ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'}`}>
                <Icon size={20} />
              </div>
              <div className="text-left">
                <div className={`font-medium ${isActive ? 'text-indigo-400' : 'text-slate-200'}`}>
                  {item.label}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-950 rounded-md p-3 border border-slate-800">
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong className="text-amber-500">Warning:</strong> Some generated files (e.g., EICAR, Shells) may trigger your local antivirus. This is intended behavior.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

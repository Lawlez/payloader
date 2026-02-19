import React, { useState } from 'react';
import { GeneratedFile } from '../types';
import { Download, FileCode, CheckCircle, Clock, Copy, Check } from 'lucide-react';

interface PreviewPanelProps {
  files: GeneratedFile[];
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ files }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (file: GeneratedFile) => {
    try {
      if (file.type.startsWith('image/') && !file.type.includes('svg')) {
        // Binary image -> Copy Base64
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            const base64 = (reader.result as string).split(',')[1];
            navigator.clipboard.writeText(base64);
            triggerCopySuccess(file.id);
          }
        };
        reader.readAsDataURL(file.blob);
      } else {
        // Text based (SVG, XML, Scripts) -> Copy Raw Text
        const text = await file.blob.text();
        navigator.clipboard.writeText(text);
        triggerCopySuccess(file.id);
      }
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const triggerCopySuccess = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (files.length === 0) {
    return (
      <div className="w-96 bg-slate-900/50 border-l border-slate-800 flex items-center justify-center p-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto flex items-center justify-center">
            <Clock className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-slate-300 font-medium">Ready to Forge</h3>
          <p className="text-slate-500 text-sm">Configure your test asset settings and click Generate to see results here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white">Generated Assets</h2>
        <p className="text-xs text-slate-500">Session History</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {files.map((file) => (
          <div key={file.id} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden group">
            {/* Preview Header */}
            <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
               {/* Pattern background for transparency */}
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
               
               {/* Actual Preview */}
               {file.type.startsWith('image/') ? (
                 <img src={file.url} alt="Preview" className="relative z-10 max-w-full max-h-full object-contain" />
               ) : (
                 <FileCode className="relative z-10 w-12 h-12 text-slate-600" />
               )}

               <div className="absolute top-2 right-2 z-20">
                 <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] text-white font-mono border border-white/10">
                   {(file.size / 1024).toFixed(2)} KB
                 </span>
               </div>
            </div>

            {/* Info Body */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                   <h4 className="text-sm font-medium text-white truncate max-w-[180px]" title={file.name}>{file.name}</h4>
                   <p className="text-xs text-slate-500 font-mono">{file.type}</p>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              
              <div className="flex gap-2 mt-3">
                <a 
                  href={file.url} 
                  download={file.name}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded transition-colors"
                >
                  <Download size={14} />
                  Download
                </a>
                <button
                  onClick={() => handleCopy(file)}
                  className="flex items-center justify-center px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
                  title={file.type.startsWith('image/') && !file.type.includes('svg') ? "Copy Base64" : "Copy Text"}
                >
                  {copiedId === file.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewPanel;
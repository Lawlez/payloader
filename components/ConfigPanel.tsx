import React from 'react';
import { GeneratorCategory, GenerationSettings, ImageFormat, FilenamePattern } from '../types';
import { AlertTriangle, Info, Shuffle, Dice5, FileSpreadsheet, Archive } from 'lucide-react';

interface ConfigPanelProps {
  category: GeneratorCategory;
  settings: GenerationSettings;
  onChange: (s: GenerationSettings) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ category, settings, onChange, isGenerating, onGenerate }) => {
  const handleChange = (field: keyof GenerationSettings, value: any) => {
    onChange({ ...settings, [field]: value });
  };

  const isChaos = category === GeneratorCategory.CHAOS;

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-950">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {category === GeneratorCategory.STANDARD && 'Configure Standard Image'}
            {category === GeneratorCategory.SECURITY && 'Construct Security Payload'}
            {category === GeneratorCategory.DATA && 'Data Injection Forge'}
            {category === GeneratorCategory.ARCHIVE && 'Archive Attack Forge'}
            {category === GeneratorCategory.ANOMALY && 'Create Anomaly File'}
            {category === GeneratorCategory.AI && 'Generate with Gemini AI'}
            {category === GeneratorCategory.CHAOS && 'Chaos Mode Shuffler'}
          </h2>
          <p className="text-slate-400">
            {category === GeneratorCategory.STANDARD && 'Create valid, spec-compliant images for UI testing.'}
            {category === GeneratorCategory.SECURITY && 'Embed malicious strings or logic into image containers.'}
            {category === GeneratorCategory.DATA && 'Create CSVs/JSONs designed to test formula injection and parsing limits.'}
            {category === GeneratorCategory.ARCHIVE && 'Generate malicious archives to test Zip Slip and decompression bombs.'}
            {category === GeneratorCategory.ANOMALY && 'Generate malformed or edge-case files to test parser resilience.'}
            {category === GeneratorCategory.AI && 'Describe an image and generate it using Google Gemini 2.5.'}
            {category === GeneratorCategory.CHAOS && 'Randomly generate a valid, malicious, or corrupt file from any category to test unexpected behaviors.'}
          </p>
        </div>

        {isChaos ? (
          <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-8 text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-indigo-900/30 rounded-full flex items-center justify-center animate-pulse">
              <Dice5 className="w-12 h-12 text-indigo-400" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-white mb-2">Ready to Roll?</h3>
              <p className="text-slate-400">
                Chaos mode will pick a random file type (Standard, Security Payload, Data, Archive, or Anomaly), apply a random filename strategy, and generate a unique test asset.
              </p>
            </div>
            <button
              onClick={onGenerate}
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              <Shuffle className="w-5 h-5" />
              Surprise Me
            </button>
          </div>
        ) : (
          <>
            {/* AI Prompt Input */}
            {category === GeneratorCategory.AI && (
              <div className="space-y-4">
                 <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">Prompt</label>
                  <textarea
                    className="bg-slate-900 border border-slate-700 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none h-32 resize-none"
                    placeholder="Describe the test image you need (e.g., 'A futuristic dashboard showing a system error')"
                    value={settings.prompt || ''}
                    onChange={(e) => handleChange('prompt', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Common Dimensions & Color (Image Only) */}
            {(category === GeneratorCategory.STANDARD || category === GeneratorCategory.SECURITY || category === GeneratorCategory.ANOMALY) && (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Width (px)</label>
                  <input
                    type="number"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={settings.width}
                    onChange={(e) => handleChange('width', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Height (px)</label>
                  <input
                    type="number"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={settings.height}
                    onChange={(e) => handleChange('height', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Background Color</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      className="h-10 w-20 rounded bg-transparent border-0 cursor-pointer"
                      value={settings.color}
                      onChange={(e) => handleChange('color', e.target.value)}
                    />
                    <input
                      type="text"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-md p-2.5 text-white font-mono text-sm"
                      value={settings.color}
                      onChange={(e) => handleChange('color', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-300">Text Overlay (Optional)</label>
                   <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={settings.text}
                    onChange={(e) => handleChange('text', e.target.value)}
                    placeholder="Test Label"
                  />
                </div>
              </div>
            )}

            {/* Format Selection (Context Sensitive) */}
            {category === GeneratorCategory.STANDARD && (
               <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Target Format</label>
                <div className="grid grid-cols-3 gap-3">
                  {[ImageFormat.PNG, ImageFormat.JPEG, ImageFormat.WEBP, ImageFormat.BMP].map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => handleChange('format', fmt)}
                      className={`p-3 rounded-md text-sm font-medium border transition-all ${
                        settings.format === fmt 
                        ? 'bg-indigo-600 border-indigo-500 text-white' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {fmt.split('/')[1].toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Data Files Config */}
            {category === GeneratorCategory.DATA && (
               <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Injection Type</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={settings.dataPayloadType}
                      onChange={(e) => handleChange('dataPayloadType', e.target.value)}
                    >
                      <option value="CSV_FORMULA_INJECTION">CSV: Formula Injection (=cmd|...)</option>
                      <option value="CSV_DDE_EXCEL">CSV: DDE Exploit (Legacy Excel)</option>
                      <option value="CSV_GOOGLE_SHEETS">CSV: Google Sheets (=IMPORTXML)</option>
                      <option value="JSON_HUGE_NESTING">JSON: Deeply Nested (Stack Overflow)</option>
                    </select>
                 </div>
                 <div className="p-4 bg-indigo-900/20 border border-indigo-800/50 rounded-md flex gap-3 text-indigo-300 text-sm">
                    <FileSpreadsheet className="flex-shrink-0 w-5 h-5" />
                    <div>
                      <p>These files use CSV Formula Injection (CFI). When opened in spreadsheet software, they may execute arbitrary commands if warnings are ignored.</p>
                    </div>
                 </div>
               </div>
            )}

            {/* Archive Config */}
            {category === GeneratorCategory.ARCHIVE && (
               <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Attack Type</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={settings.archiveType}
                      onChange={(e) => handleChange('archiveType', e.target.value)}
                    >
                      <option value="ZIP_SLIP">Zip Slip (../../ path traversal)</option>
                      <option value="ZIP_BOMB_FLAT">Zip Bomb (Flat 10MB Expansion)</option>
                    </select>
                 </div>
                 {settings.archiveType === 'ZIP_SLIP' && (
                    <div className="p-4 bg-amber-900/20 border border-amber-800/50 rounded-md flex gap-3 text-amber-400 text-sm">
                      <Archive className="flex-shrink-0 w-5 h-5" />
                      <p>This generates a valid Zip file containing a file named <code>../../evil.txt</code>. Vulnerable extractors may overwrite system files.</p>
                   </div>
                 )}
                 {settings.archiveType === 'ZIP_BOMB_FLAT' && (
                    <div className="p-4 bg-indigo-900/20 border border-indigo-800/50 rounded-md flex gap-3 text-indigo-300 text-sm">
                      <Archive className="flex-shrink-0 w-5 h-5" />
                      <p>Creates a zip that expands to 10MB of 'A' characters. Useful for testing disk quota or memory limits.</p>
                   </div>
                 )}
               </div>
            )}

            {/* Security Specific Options */}
            {category === GeneratorCategory.SECURITY && (
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Payload Type</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={settings.payloadType}
                      onChange={(e) => handleChange('payloadType', e.target.value)}
                    >
                      <optgroup label="Cross-Site Scripting (XSS)">
                        <option value="XSS_ALERT">SVG: Simple XSS (Alert)</option>
                        <option value="XSS_REMOTE">SVG: Remote Script Load</option>
                        <option value="METADATA_XSS">JPEG: XSS in Comment Metadata</option>
                      </optgroup>
                      <optgroup label="XML External Entity (XXE)">
                        <option value="XXE_BASIC">SVG: Basic XXE (File Read)</option>
                        <option value="XXE_OOB">SVG: Out-of-Band XXE</option>
                        <option value="XXE_BILLION_LAUGHS">SVG: Billion Laughs (DoS)</option>
                      </optgroup>
                      <optgroup label="Web Shells / Polyglots">
                        <option value="POLYGLOT_JS">GIF: Polyglot JS (GIF89a=...)</option>
                        <option value="PHP_SHELL_GIF">GIF: PHP Shell Injection</option>
                        <option value="ASPX_SHELL">BMP: ASPX Shell Polyglot</option>
                        <option value="JSP_SHELL">JSP: Shell (Raw/Polyglot)</option>
                      </optgroup>
                    </select>
                 </div>
                 <div className="p-4 bg-amber-900/20 border border-amber-800/50 rounded-md flex gap-3 text-amber-400 text-sm">
                    <AlertTriangle className="flex-shrink-0 w-5 h-5" />
                    <p>These files contain actual attack payloads. Do not upload to production systems unless authorized.</p>
                 </div>
              </div>
            )}

            {/* Anomaly Specific Options */}
            {category === GeneratorCategory.ANOMALY && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Anomaly Type</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={settings.anomalyType}
                    onChange={(e) => handleChange('anomalyType', e.target.value)}
                  >
                    <option value="FAKE_HUGE">Fake Huge Dimensions (50k px)</option>
                    <option value="EICAR_APPEND">Valid Image + EICAR Signature</option>
                    <option value="TRUNCATED_FILE">Truncated Image (Cutoff Data)</option>
                    <option value="GARBAGE_CONTENT">Random Binary Garbage</option>
                  </select>
                </div>
                
                {settings.anomalyType === 'FAKE_HUGE' && (
                  <div className="p-4 bg-indigo-900/20 border border-indigo-800/50 rounded-md flex gap-3 text-indigo-300 text-sm">
                     <Info className="flex-shrink-0 w-5 h-5" />
                     <div>
                        <p className="font-semibold mb-1">How this works</p>
                        <p>We generate a tiny 1px BMP file but rewrite the header to claim it is 50,000 x 50,000. This tests if systems trust the header without checking actual data size (allocation panic vulnerability).</p>
                     </div>
                  </div>
                )}
              </div>
            )}

            {/* Filename Attack Strategy - Available for all non-AI/Chaos */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                Filename Strategy
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 text-[10px]">FILE UPLOAD TEST</span>
              </label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                value={settings.filenamePattern}
                onChange={(e) => handleChange('filenamePattern', e.target.value)}
              >
                <option value={FilenamePattern.STANDARD}>Standard (e.g., test-image.png)</option>
                <option value={FilenamePattern.DOUBLE_EXTENSION}>Double Extension (image.php.png)</option>
                <option value={FilenamePattern.PATH_TRAVERSAL}>Path Traversal (../../../image.png)</option>
                <option value={FilenamePattern.NULL_BYTE}>Null Byte Injection (image.png%00.php)</option>
                <option value={FilenamePattern.SHELL_INJECTION}>Shell Injection (image;sleep 10;.png)</option>
                <option value={FilenamePattern.XSS_FILENAME}>XSS in Filename (&lt;script&gt;.png)</option>
                <option value={FilenamePattern.WHITESPACE}>Whitespace Padding ( image.png )</option>
                <option value={FilenamePattern.LONG_NAME}>Extremely Long Name</option>
              </select>
            </div>

            <div className="pt-6">
              <button
                onClick={onGenerate}
                disabled={isGenerating}
                className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform active:scale-95 ${
                  isGenerating 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/20'
                }`}
              >
                {isGenerating ? 'Forging Asset...' : 'Generate Test Image'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ConfigPanel;

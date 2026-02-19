import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ConfigPanel from './components/ConfigPanel';
import PreviewPanel from './components/PreviewPanel';
import { GeneratorCategory, GenerationSettings, ImageFormat, GeneratedFile, FilenamePattern } from './types';
import { 
  generateCanvasImage, 
  generateSecuritySVG, 
  generateAnomaly, 
  generateJpegWithMetadata, 
  generateGifPolyglot,
  generatePhpShellGif,
  generateAspxPolyglot,
  generateJspPolyglot
} from './services/imageGenerators';
import { generateDataFile } from './services/dataGenerators';
import { generateArchive } from './services/archiveGenerators';
import { applyFilenamePattern } from './services/filenameService';
import { generateAIImage } from './services/geminiService';

const simpleId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<GeneratorCategory>(GeneratorCategory.STANDARD);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  
  const [settings, setSettings] = useState<GenerationSettings>({
    width: 640,
    height: 480,
    color: '#6366f1',
    text: 'Test Image',
    format: ImageFormat.PNG,
    fileName: 'test-image',
    filenamePattern: FilenamePattern.STANDARD,
    payloadType: 'XSS_ALERT',
    dataPayloadType: 'CSV_FORMULA_INJECTION',
    archiveType: 'ZIP_SLIP',
    anomalyType: 'FAKE_HUGE',
    prompt: ''
  });

  const generateRandomSettings = (): { cat: GeneratorCategory, set: GenerationSettings } => {
    const categories = [GeneratorCategory.STANDARD, GeneratorCategory.SECURITY, GeneratorCategory.DATA, GeneratorCategory.ARCHIVE, GeneratorCategory.ANOMALY];
    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    
    // Randomize basic settings
    const newSettings: GenerationSettings = {
      ...settings,
      width: Math.floor(Math.random() * 800) + 100,
      height: Math.floor(Math.random() * 800) + 100,
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      text: 'Chaos ' + simpleId(),
      fileName: 'chaos_' + simpleId(),
    };

    // Randomize specific settings based on category
    if (randomCat === GeneratorCategory.STANDARD) {
      const formats = [ImageFormat.PNG, ImageFormat.JPEG, ImageFormat.WEBP, ImageFormat.BMP];
      newSettings.format = formats[Math.floor(Math.random() * formats.length)];
    }
    else if (randomCat === GeneratorCategory.SECURITY) {
      const payloads: any[] = ['XSS_ALERT', 'XSS_REMOTE', 'XXE_BASIC', 'METADATA_XSS', 'POLYGLOT_JS', 'PHP_SHELL_GIF', 'ASPX_SHELL', 'JSP_SHELL'];
      newSettings.payloadType = payloads[Math.floor(Math.random() * payloads.length)];
    }
    else if (randomCat === GeneratorCategory.DATA) {
      const payloads: any[] = ['CSV_FORMULA_INJECTION', 'CSV_DDE_EXCEL', 'CSV_GOOGLE_SHEETS', 'JSON_HUGE_NESTING'];
      newSettings.dataPayloadType = payloads[Math.floor(Math.random() * payloads.length)];
    }
    else if (randomCat === GeneratorCategory.ARCHIVE) {
      const payloads: any[] = ['ZIP_SLIP', 'ZIP_BOMB_FLAT'];
      newSettings.archiveType = payloads[Math.floor(Math.random() * payloads.length)];
    }
    else if (randomCat === GeneratorCategory.ANOMALY) {
       const anomalies: any[] = ['FAKE_HUGE', 'EICAR_APPEND', 'TRUNCATED_FILE', 'GARBAGE_CONTENT'];
       newSettings.anomalyType = anomalies[Math.floor(Math.random() * anomalies.length)];
    }

    // 30% chance to pick a weird filename pattern
    if (Math.random() > 0.7) {
      const patterns = Object.values(FilenamePattern).filter(p => p !== FilenamePattern.STANDARD);
      newSettings.filenamePattern = patterns[Math.floor(Math.random() * patterns.length)];
    } else {
      newSettings.filenamePattern = FilenamePattern.STANDARD;
    }

    return { cat: randomCat, set: newSettings };
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    let blob: Blob | null = null;
    let name = settings.fileName;
    let extension = '';
    
    let activeCategory = selectedCategory;
    let activeSettings = settings;

    // Handle Chaos Mode
    if (selectedCategory === GeneratorCategory.CHAOS) {
      const randomizer = generateRandomSettings();
      activeCategory = randomizer.cat;
      activeSettings = randomizer.set;
    }

    try {
      // 1. Determine Logic based on category
      switch (activeCategory) {
        case GeneratorCategory.STANDARD:
          blob = await generateCanvasImage(activeSettings);
          extension = activeSettings.format.split('/')[1];
          if (extension === 'svg+xml') extension = 'svg';
          break;

        case GeneratorCategory.SECURITY:
          if (activeSettings.payloadType?.startsWith('XSS') || activeSettings.payloadType?.startsWith('XXE')) {
            blob = generateSecuritySVG(activeSettings);
            extension = 'svg';
          } 
          else if (activeSettings.payloadType === 'METADATA_XSS') {
            blob = await generateJpegWithMetadata(activeSettings, '<script>alert("XSS")</script>');
            extension = 'jpg';
          }
          else if (activeSettings.payloadType === 'POLYGLOT_JS') {
            blob = generateGifPolyglot(activeSettings);
            extension = 'gif';
          }
          else if (activeSettings.payloadType === 'PHP_SHELL_GIF') {
            blob = generatePhpShellGif(activeSettings);
            extension = 'gif';
          }
          else if (activeSettings.payloadType === 'ASPX_SHELL') {
            blob = generateAspxPolyglot(activeSettings);
            extension = 'bmp'; // Disguise as BMP
          }
          else if (activeSettings.payloadType === 'JSP_SHELL') {
            blob = generateJspPolyglot(activeSettings);
            extension = 'jsp';
          }
          name = `payload_${activeSettings.payloadType?.toLowerCase()}`;
          break;

        case GeneratorCategory.DATA:
          blob = await generateDataFile(activeSettings);
          if (activeSettings.dataPayloadType?.startsWith('CSV')) {
            extension = 'csv';
            name = 'injection';
          } else {
            extension = 'json';
            name = 'deep_nest';
          }
          break;

        case GeneratorCategory.ARCHIVE:
          blob = await generateArchive(activeSettings);
          extension = 'zip';
          name = activeSettings.archiveType === 'ZIP_SLIP' ? 'zip_slip' : 'zip_bomb';
          break;

        case GeneratorCategory.ANOMALY:
          blob = await generateAnomaly(activeSettings);
          if (activeSettings.anomalyType === 'FAKE_HUGE') extension = 'bmp';
          else if (activeSettings.anomalyType === 'EICAR_APPEND') extension = 'jpg'; 
          else if (activeSettings.anomalyType === 'TRUNCATED_FILE') extension = 'jpg';
          else if (activeSettings.anomalyType === 'GARBAGE_CONTENT') extension = 'bin';
          name = `anomaly_${activeSettings.anomalyType?.toLowerCase()}`;
          break;

        case GeneratorCategory.AI:
          if (!activeSettings.prompt) throw new Error("Prompt is required");
          blob = await generateAIImage(activeSettings.prompt);
          extension = 'png';
          name = `ai_gen_${simpleId()}`;
          break;
      }

      if (blob) {
        const finalName = applyFilenamePattern(name, extension, activeSettings.filenamePattern);
        const url = URL.createObjectURL(blob);
        const newFile: GeneratedFile = {
          id: simpleId(),
          name: finalName,
          url,
          blob,
          size: blob.size,
          type: blob.type,
          timestamp: Date.now()
        };

        setGeneratedFiles(prev => [newFile, ...prev]);
      }

    } catch (error: any) {
      console.error("Generation failed", error);
      alert(`Error generating file: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <Sidebar selected={selectedCategory} onSelect={setSelectedCategory} />
      
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        <ConfigPanel 
          category={selectedCategory} 
          settings={settings} 
          onChange={setSettings}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
        />
        <PreviewPanel files={generatedFiles} />
      </div>
    </div>
  );
};

export default App;

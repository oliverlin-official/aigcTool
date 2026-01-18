
import React, { useState, useCallback, useRef } from 'react';
import ThreeDViewport from './components/ThreeDViewport';
import { CameraParams, GenerationConfig, GenerationResult } from './types';
import { DEFAULT_CAMERA, DEFAULT_CONFIG, CAMERA_SLIDERS, CAMERA_PRESETS } from './constants';
import { generateImageFromCamera } from './services/geminiService';

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [camera, setCamera] = useState<CameraParams>(DEFAULT_CAMERA);
  const [config, setConfig] = useState<GenerationConfig>(DEFAULT_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setSourceImage(readerEvent.target?.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleProMode = async () => {
    if (!config.proMode) {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }
    }
    setConfig(prev => ({ ...prev, proMode: !prev.proMode }));
  };

  const applyPreset = (preset: typeof CAMERA_PRESETS[0]) => {
    setCamera({
      azimuth: preset.azimuth,
      elevation: preset.elevation,
      distance: preset.distance,
    });
  };

  const handleGenerate = async () => {
    if (!sourceImage) {
      setError("Please upload an image first.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateImageFromCamera(sourceImage, camera, config);
      setHistory(prev => [{ ...result, timestamp: Date.now() }, ...prev]);
    } catch (err: any) {
      setError(err.message || "Failed to generate image. Please try again.");
      if (err.message?.includes("entity was not found")) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent italic">Perspectiv</span>
            <span className="text-slate-500 font-light">— Gemini 3D Engine</span>
          </h1>
          <p className="text-slate-400 mt-1">
            Dynamic image re-projection powered by Gemini Vision.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={toggleProMode}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${config.proMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
           >
             {config.proMode ? '✨ Pro Engine Active' : 'Switch to Pro Engine'}
           </button>
           <a 
             href="https://ai.google.dev/gemini-api/docs/billing" 
             target="_blank" 
             rel="noreferrer"
             className="text-xs text-slate-500 hover:text-slate-400 underline"
           >
             Billing Info
           </a>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Input and Controls */}
        <div className="space-y-6">
          
          {/* Input Image Block */}
          <div className="bg-slate-800/40 rounded-xl border border-slate-700 p-4 relative min-h-[300px] flex flex-col group">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-blue-400">
                <i className="fa-regular fa-image" /> Input Image
              </h2>
              {sourceImage && (
                <button onClick={() => setSourceImage(null)} className="text-slate-500 hover:text-red-400 transition-colors">
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>

            <div 
              className={`flex-grow border-2 border-dashed rounded-lg transition-colors flex items-center justify-center relative overflow-hidden cursor-pointer ${sourceImage ? 'border-transparent' : 'border-slate-700 hover:border-slate-500'}`}
              onClick={() => !sourceImage && fileInputRef.current?.click()}
            >
              {sourceImage ? (
                <img src={sourceImage} alt="Input" className="w-full h-full object-contain max-h-[400px]" />
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 group-hover:border-blue-500/50 transition-colors">
                    <i className="fa-solid fa-cloud-arrow-up text-2xl text-slate-600 group-hover:text-blue-400" />
                  </div>
                  <p className="text-slate-400">Click or drag to upload source image</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
            </div>
          </div>

          {/* 3D Viewport Block */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-300 px-1">
              <i className="fa-solid fa-cube" /> Viewport Controls
            </h2>
            <ThreeDViewport params={camera} onChange={setCamera} imageUrl={sourceImage || undefined} />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !sourceImage}
            className={`w-full py-5 rounded-xl font-bold text-lg shadow-2xl transition-all flex items-center justify-center gap-3 overflow-hidden relative group ${
              isGenerating 
              ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98] shadow-indigo-500/30'
            }`}
          >
            {isGenerating ? (
              <>
                <i className="fa-solid fa-wand-sparkles fa-spin text-indigo-400" />
                <span>Generating New Angle...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-camera-rotate group-hover:rotate-45 transition-transform" />
                <span>Re-Project Image</span>
              </>
            )}
          </button>

          {/* Slider Controls Block */}
          <div className="bg-slate-800/40 rounded-xl border border-slate-700 p-6 space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <i className="fa-solid fa-sliders" /> Manual Refinement
                </h2>
                
                {/* Presets Menu */}
                <div className="relative group">
                    <button className="flex items-center gap-2 text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-slate-300 transition-colors">
                        <i className="fa-solid fa-list-check" /> Presets
                    </button>
                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all p-2 z-20">
                        {CAMERA_PRESETS.map((preset) => (
                            <button
                                key={preset.name}
                                onClick={() => applyPreset(preset)}
                                className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-between"
                            >
                                {preset.name}
                                <i className="fa-solid fa-chevron-right text-[8px] opacity-0 group-hover:opacity-30" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CAMERA_SLIDERS.map((slider) => (
                  <div key={slider.key} className="space-y-3 bg-slate-900/40 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {slider.label}
                      </label>
                      <span className="text-xs font-mono text-emerald-400">{camera[slider.key]}</span>
                    </div>
                    <input
                      type="range"
                      min={slider.min}
                      max={slider.max}
                      step={slider.step}
                      value={camera[slider.key]}
                      onChange={(e) => setCamera(prev => ({ ...prev, [slider.key]: parseFloat(e.target.value) }))}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column: Output and Advanced Settings */}
        <div className="space-y-6">
          
          {/* Output Image Block */}
          <div className="bg-slate-800/40 rounded-xl border border-slate-700 p-4 min-h-[500px] flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-pink-400">
                <i className="fa-solid fa-sparkles" /> Resulting View
              </h2>
              {history.length > 0 && (
                <div className="flex items-center gap-2">
                  <button className="text-slate-500 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg"><i className="fa-solid fa-download" /></button>
                </div>
              )}
            </div>

            <div className="flex-grow rounded-lg bg-slate-900/80 flex items-center justify-center overflow-hidden border border-slate-700/30 relative">
              {isGenerating ? (
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fa-solid fa-eye text-2xl text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm font-medium animate-pulse tracking-wide uppercase">Processing Projection...</p>
                </div>
              ) : history.length > 0 ? (
                <img src={history[0].imageUrl} alt="Result" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center p-12">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-700 opacity-30">
                    <i className="fa-regular fa-image text-2xl text-slate-500" />
                  </div>
                  <p className="text-slate-600 text-sm">Target perspective will materialize here.</p>
                </div>
              )}

              {error && (
                <div className="absolute inset-x-0 bottom-0 bg-red-600/90 text-white p-4 text-xs font-medium backdrop-blur-sm flex items-start gap-3 border-t border-red-500/30">
                  <i className="fa-solid fa-triangle-exclamation mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Settings Block */}
          <div className="bg-slate-800/40 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/60 text-sm font-semibold text-slate-300 flex items-center gap-2">
                <i className="fa-solid fa-sliders-h" /> Advanced Parameters
            </div>
            
            <div className="p-6 space-y-8">
              {/* Seed Control */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Generation Seed</label>
                  <span className="text-xs font-mono text-indigo-400">{config.seed}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10000"
                    value={config.seed}
                    onChange={(e) => setConfig(prev => ({ ...prev, seed: parseInt(e.target.value) }))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex items-center gap-4 justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border border-slate-600 flex items-center justify-center transition-colors ${config.randomizeSeed ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-900'}`}>
                            {config.randomizeSeed && <i className="fa-solid fa-check text-[8px] text-white" />}
                        </div>
                        <input type="checkbox" checked={config.randomizeSeed} onChange={(e) => setConfig(prev => ({ ...prev, randomizeSeed: e.target.checked }))} className="hidden" />
                        <span className="text-xs text-slate-400 group-hover:text-slate-300">Randomize on each turn</span>
                    </label>
                    <button onClick={() => setConfig(prev => ({ ...prev, seed: Math.floor(Math.random() * 10000) }))} className="text-[10px] text-slate-500 hover:text-white uppercase font-bold tracking-tighter">
                        Shuffle Seed
                    </button>
                </div>
              </div>

              {/* Engine Config */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aspect Ratio</label>
                  <select 
                    value={config.aspectRatio}
                    onChange={(e) => setConfig(prev => ({ ...prev, aspectRatio: e.target.value as any }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="1:1">1:1 Square</option>
                    <option value="4:3">4:3 Desktop</option>
                    <option value="3:4">3:4 Mobile</option>
                    <option value="16:9">16:9 Cinema</option>
                    <option value="9:16">9:16 Vertical</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Output Resolution</label>
                  <select 
                    value={config.resolution}
                    onChange={(e) => setConfig(prev => ({ ...prev, resolution: e.target.value as any }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="1K">1K (Standard)</option>
                    <option value="2K">2K (High Def)</option>
                    <option value="4K">4K (Ultra HD)</option>
                  </select>
                  {!config.proMode && <p className="text-[9px] text-slate-600 mt-1 italic">* 2K/4K requires Pro Engine</p>}
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-slate-800/40 rounded-xl border border-slate-700 p-4 space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <i className="fa-solid fa-timeline" /> Timeline
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {history.length > 0 ? (
                history.map((item, idx) => (
                  <div key={item.timestamp} className="flex-shrink-0 w-24 group cursor-pointer" onClick={() => {
                      const newHistory = [...history];
                      const selected = newHistory.splice(idx, 1)[0];
                      setHistory([selected, ...newHistory]);
                  }}>
                    <div className="aspect-square rounded-lg border border-slate-700 overflow-hidden relative group-hover:border-indigo-500 transition-colors">
                        <img src={item.imageUrl} className="w-full h-full object-cover" alt="History" />
                        <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <i className="fa-solid fa-eye text-white text-xs" />
                        </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full py-6 text-center text-slate-700 text-[10px] italic border border-dashed border-slate-700 rounded-lg">
                  History is empty
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="pt-8 pb-12 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-[10px] text-slate-600 uppercase tracking-[0.2em]">
            Precision Projection Protocol // GEMINI-3-CORE
        </div>
        <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[10px] text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                API Connection Active
            </span>
            <span className="text-[10px] text-slate-500">© 2025 AI-LENS CO.</span>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 12px;
            width: 12px;
            border-radius: 50%;
            background: #6366f1;
            cursor: pointer;
            box-shadow: 0 0 8px rgba(99, 102, 241, 0.5);
            margin-top: -4px;
        }
      `}</style>
    </div>
  );
};

export default App;

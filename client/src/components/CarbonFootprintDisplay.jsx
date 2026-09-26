import React, { useState } from 'react';
import { useCarbonFootprint } from 'react-carbon-footprint';

/**
 * CarbonFootprintDisplay - Client-side environmental impact indicator
 * Uses react-carbon-footprint (Sustainable Web Design model via CO2.js)
 * to estimate real-time network payload bytes and resulting CO2 emissions.
 */
const CarbonFootprintDisplay = () => {
  const [gCO2, bytesTransferred] = useCarbonFootprint();
  const [isMinimized, setIsMinimized] = useState(false);

  // If minimized, display a small floating eco badge
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 rounded-full shadow-lg text-xs font-medium backdrop-blur transition-all"
        title="View Carbon Footprint Metrics"
        aria-label="Expand carbon footprint widget"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Eco-Track</span>
        <span className="text-slate-300 font-mono text-[11px]">{gCO2.toFixed(3)}g</span>
      </button>
    );
  }

  return (
    <aside
      aria-label="Network Carbon Footprint Monitor"
      className="fixed bottom-4 right-4 z-50 bg-slate-900/95 text-white backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-xs max-w-[270px] w-full transition-all animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800">
        <div className="flex items-center gap-2 font-semibold text-emerald-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Eco-Track: Carbon Footprint</span>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-slate-400 hover:text-white text-xs px-1 hover:bg-slate-800 rounded transition-colors"
          title="Minimize widget"
          aria-label="Minimize carbon footprint widget"
        >
          ✕
        </button>
      </div>

      <div className="space-y-1.5 text-slate-300">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Transferred:</span>
          <span className="font-mono font-medium text-slate-100">
            {(bytesTransferred || 0).toLocaleString()} B
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">CO₂e Emissions:</span>
          <span className="font-mono font-medium text-emerald-300">
            {(gCO2 || 0).toFixed(4)} g
          </span>
        </div>
      </div>

      <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <span>Model: SWD (@tgwf/co2)</span>
        <span className="text-emerald-400 font-medium">CSE-2200</span>
      </div>
    </aside>
  );
};

export default CarbonFootprintDisplay;

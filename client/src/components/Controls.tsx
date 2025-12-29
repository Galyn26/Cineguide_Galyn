import React from 'react';
import { motion } from 'framer-motion';
import { Camera, History, Zap } from 'lucide-react';

interface ControlsProps {
  onCapture: () => void;
  onHistoryClick: () => void;
  isAnalyzing: boolean;
  selectedTemplate: string | null;
  onTemplateSelect: (template: string | null) => void;
}

const TEMPLATES = [
  { id: 'overhead', label: 'Overhead', icon: 'Top' },
  { id: 'under-angle', label: 'Under Angle', icon: 'Low' },
  { id: 'wide', label: 'Cinematic Wide', icon: 'Wide' },
  { id: 'portrait', label: 'Portrait', icon: 'Blur' },
];

export const Controls: React.FC<ControlsProps> = ({ 
  onCapture, 
  onHistoryClick, 
  isAnalyzing,
  selectedTemplate,
  onTemplateSelect
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-30">
      
      {/* Template Selector */}
      <div className="max-w-md mx-auto mb-8 overflow-x-auto no-scrollbar flex gap-3 px-2">
        {TEMPLATES.map((t) => (
          <motion.button
            key={t.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTemplateSelect(selectedTemplate === t.id ? null : t.id)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-xl border backdrop-blur-md transition-all duration-300
              ${selectedTemplate === t.id 
                ? 'bg-primary border-primary text-black font-bold shadow-[0_0_15px_rgba(var(--primary),0.5)]' 
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/30'
              }
            `}
          >
            <span className="text-xs uppercase tracking-widest">{t.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="max-w-md mx-auto flex items-center justify-between">
        
        {/* History Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onHistoryClick}
          className="p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors shadow-lg"
        >
          <History className="w-6 h-6" />
        </motion.button>

        {/* Shutter Button */}
        <div className="relative group">
          {/* Outer glow ring */}
          <div className="absolute -inset-2 bg-gradient-to-r from-primary to-orange-500 rounded-full blur opacity-10 group-hover:opacity-40 transition duration-500" />
          
          <motion.button
            onClick={onCapture}
            disabled={isAnalyzing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-2xl transition-all duration-500
              ${isAnalyzing 
                ? 'bg-white/5 border-white/10 cursor-not-allowed' 
                : 'bg-white border-white hover:border-primary active:scale-90'
              }
            `}
          >
            {isAnalyzing ? (
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-black border-2 border-white/50 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                 <div className="w-4 h-4 rounded-sm bg-primary/40 animate-pulse" />
              </div>
            )}
          </motion.button>
        </div>

        {/* Target Lock Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors shadow-lg"
        >
          <Zap className="w-6 h-6" />
        </motion.button>

      </div>
      
      <div className="text-center mt-6">
        <p className="text-[9px] font-display font-bold tracking-[0.3em] text-white/20 uppercase">
          Neural Director • Precision Guidance Active
        </p>
      </div>
    </div>
  );
};

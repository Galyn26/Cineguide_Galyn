import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Check, Move, ZoomIn, ZoomOut, ChevronRight, ChevronLeft } from 'lucide-react';

interface GuidanceOverlayProps {
  action?: "UP" | "DOWN" | "LEFT" | "RIGHT" | "FORWARD" | "BACKWARD" | "OK";
  advice?: string;
  onDismiss: () => void;
}

export const GuidanceOverlay: React.FC<GuidanceOverlayProps> = ({ action, advice, onDismiss }) => {
  if (!action) return null;

  const renderIcon = () => {
    const iconProps = { size: 64, className: "text-black", strokeWidth: 3 };
    
    switch (action) {
      case "UP": return <ArrowUp {...iconProps} />;
      case "DOWN": return <ArrowDown {...iconProps} />;
      case "LEFT": return <ArrowLeft {...iconProps} />;
      case "RIGHT": return <ArrowRight {...iconProps} />;
      case "FORWARD": return <div className="relative"><ArrowUp {...iconProps} /><ChevronRight className="absolute top-0 -right-4 w-12 h-12 text-black/50" /></div>;
      case "BACKWARD": return <div className="relative"><ArrowDown {...iconProps} /><ChevronLeft className="absolute top-0 -left-4 w-12 h-12 text-black/50" /></div>;
      case "OK": return <Check {...iconProps} />;
      default: return <Move {...iconProps} />;
    }
  };

  const getAnimation = () => {
    switch (action) {
      case "UP": return { y: [10, -30, 10], rotateX: 20 };
      case "DOWN": return { y: [-10, 30, -10], rotateX: -20 };
      case "LEFT": return { x: [10, -30, 10], rotateY: -20 };
      case "RIGHT": return { x: [-10, 30, -10], rotateY: 20 };
      case "FORWARD": return { scale: [1, 1.3, 1], z: [0, 100, 0] };
      case "BACKWARD": return { scale: [1.3, 1, 1.3], z: [0, -100, 0] };
      case "OK": return { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] };
      default: return {};
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-20 p-8 perspective-1000">
      
      {/* Dynamic AR-style Indicator */}
      <motion.div
        initial={{ scale: 0, opacity: 0, rotateX: 45 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          rotateX: 20,
          ...getAnimation()
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ 
          duration: 2, 
          repeat: action === "OK" ? 0 : Infinity, 
          ease: "easeInOut" 
        }}
        className={`
          w-40 h-40 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(var(--primary),0.6)] mb-8
          ${action === 'OK' ? 'bg-green-500 shadow-green-500/50' : 'bg-primary shadow-primary/50'}
          backdrop-blur-sm bg-opacity-80
        `}
      >
        <div className="drop-shadow-[0_0_10px_rgba(0,0,0,0.3)]">
          {renderIcon()}
        </div>
      </motion.div>

      {/* Advice Text */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="glass-panel p-6 rounded-2xl max-w-md text-center pointer-events-auto border border-white/10"
      >
        <h3 className="text-primary font-display text-sm font-bold uppercase tracking-widest mb-2 opacity-80">
          AI Cinematographer
        </h3>
        <p className="text-white text-xl font-medium leading-relaxed font-display italic">
          "{advice}"
        </p>
        
        <button 
          onClick={onDismiss}
          className="mt-6 text-xs text-white/40 hover:text-white uppercase tracking-widest font-bold transition-colors"
        >
          Dismiss Guidance
        </button>
      </motion.div>
    </div>
  );
};

import React, { useCallback, useRef } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraViewProps {
  onCapture: (imageSrc: string) => void;
  isAnalyzing: boolean;
  onTargetLocked: (box: { x: number, y: number, width: number, height: number } | null) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, isAnalyzing, onTargetLocked }) => {
  const webcamRef = useRef<Webcam>(null);
  const [dragStart, setDragStart] = React.useState<{ x: number, y: number } | null>(null);
  const [currentBox, setCurrentBox] = React.useState<{ x: number, y: number, width: number, height: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
    setDragStart({ x, y });
    setCurrentBox(null);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragStart) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
    
    setCurrentBox({
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      width: Math.abs(x - dragStart.x),
      height: Math.abs(y - dragStart.y)
    });
  };

  const handleMouseUp = () => {
    if (currentBox && currentBox.width > 10) {
      onTargetLocked(currentBox);
    } else {
      onTargetLocked(null);
      setCurrentBox(null);
    }
    setDragStart(null);
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  const videoConstraints = {
    width: { min: 640, ideal: 1920, max: 2560 },
    height: { min: 480, ideal: 1080, max: 1440 },
    facingMode: "environment"
  };

  return (
    <div 
      className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center cursor-crosshair touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    >
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="absolute inset-0 w-full h-full object-cover"
        forceScreenshotSourceSize={true}
      />

      {/* Target Selection Box */}
      {currentBox && (
        <div 
          className="absolute border-2 border-primary bg-primary/10 z-20 pointer-events-none rounded-sm shadow-[0_0_15px_rgba(var(--primary),0.3)]"
          style={{
            left: currentBox.x,
            top: currentBox.y,
            width: currentBox.width,
            height: currentBox.height
          }}
        >
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary" />
        </div>
      )}
      
      {/* Scanning Overlay Effect */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 pointer-events-none"
          >
            <div className="absolute inset-0 bg-primary/10" />
            <motion.div
              className="absolute top-0 left-0 right-0 h-1 bg-primary shadow-[0_0_20px_2px_var(--primary)]"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="glass-panel px-6 py-3 rounded-full">
                <p className="text-primary font-display font-bold tracking-widest text-sm uppercase animate-pulse">
                  Analyzing Scene Geometry...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Viewfinder Grid (Cinematic Touch) */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="w-full h-full border-[1px] border-white/30 grid grid-cols-3 grid-rows-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="border-[0.5px] border-white/20" />
          ))}
        </div>
      </div>
    </div>
  );
};

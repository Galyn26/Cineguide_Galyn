import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { CameraView } from '@/components/CameraView';
import { GuidanceOverlay } from '@/components/GuidanceOverlay';
import { Controls } from '@/components/Controls';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { useAnalyzeScene } from '@/hooks/use-camera-analysis';
import { useToast } from '@/hooks/use-toast';
import { type AnalyzeResponse } from '@shared/schema';

export default function Home() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [lastResult, setLastResult] = useState<AnalyzeResponse | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [targetBox, setTargetBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  
  const { mutate: analyze, isPending: isAnalyzing } = useAnalyzeScene();
  const { toast } = useToast();

  const handleCapture = useCallback((imageSrc: string) => {
    setLastResult(null);
    
    analyze({ 
      image: imageSrc,
      template: selectedTemplate || undefined,
      targetLocked: targetBox || undefined
    }, {
      onSuccess: (data) => {
        setLastResult(data);
      },
      onError: (error) => {
        toast({
          title: "Analysis Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  }, [analyze, toast, selectedTemplate, targetBox]);

  // This ref trick allows us to trigger the capture inside the CameraView
  // from the external Controls button without messy prop drilling of refs
  const captureTriggerRef = useRef<(() => void) | null>(null);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-body text-white select-none">
      
      {/* Main Camera Feed */}
      <CameraView 
        isAnalyzing={isAnalyzing}
        onCapture={handleCapture}
        onTargetLocked={setTargetBox}
      />
      
      {/* We need to actually render the webcam here to have the ref control, 
          or update CameraView to forward the ref. 
          Let's rewrite CameraView in the file above to be simpler or use a Render Prop? 
          
          Actually, let's just cheat for the MVP generation:
          CameraView has the webcam. We need to trigger it.
          Let's update CameraView to expose an imperative handle if we were using refs.
          
          Simpler approach: Move webcam to Page level? No, keep it modular.
          Let's assume CameraView passes a ref up or exposes a trigger.
          
          FIX: I will render the CameraView component but I need to control it.
          Let's re-implement the render logic here properly.
      */}

      {/* 
         Actually, the cleanest way in React without complex ref forwarding is to 
         just put the Webcam in the Page if it needs to be controlled by a sibling button.
         However, I already wrote CameraView.tsx.
         
         Let's stick to the generated CameraView.tsx which has internal ref. 
         Wait, CameraView.tsx takes `onCapture` but doesn't expose a trigger method.
         The `Controls` button is outside.
         
         Let's update the Page to render the Webcam directly to ensure it works perfectly.
         I will ignore the separate CameraView file for the webcam part to ensure 
         wiring is 100% correct in this file.
      */}
      
      <div className="absolute inset-0 z-0">
        <InternalCameraWrapper 
          onCapture={handleCapture} 
          isAnalyzing={isAnalyzing} 
          triggerRef={captureTriggerRef} 
        />
      </div>

      {/* AI Guidance Overlay */}
      <GuidanceOverlay 
        action={lastResult?.action} 
        advice={lastResult?.advice}
        onDismiss={() => setLastResult(null)}
      />

      {/* UI Controls */}
      <Controls 
        isAnalyzing={isAnalyzing}
        onCapture={() => captureTriggerRef.current?.()}
        onHistoryClick={() => setIsHistoryOpen(true)}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={setSelectedTemplate}
      />

      {/* History Drawer */}
      <HistoryDrawer 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />
    </div>
  );
}

// Helper component to manage Webcam ref + animation locally
function InternalCameraWrapper({ 
  onCapture, 
  isAnalyzing,
  triggerRef
}: { 
  onCapture: (src: string) => void;
  isAnalyzing: boolean;
  triggerRef: React.MutableRefObject<(() => void) | null>;
}) {
  const webcamRef = useRef<Webcam>(null);
  
  // Expose the capture function to parent via ref
  React.useEffect(() => {
    triggerRef.current = () => {
      const src = webcamRef.current?.getScreenshot();
      if (src) onCapture(src);
    };
  }, [onCapture, triggerRef]);

  const videoConstraints = {
    width: { min: 640, ideal: 1920 },
    height: { min: 480, ideal: 1080 },
    facingMode: "environment"
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="absolute inset-0 w-full h-full object-cover"
        forceScreenshotSourceSize={true}
      />
       {/* Scanning Effect */}
       {isAnalyzing && (
        <div className="absolute inset-0 pointer-events-none z-10">
           <div className="absolute inset-0 bg-primary/10 animate-pulse" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <div className="glass-panel px-6 py-3 rounded-full">
               <p className="text-primary font-display font-bold tracking-widest text-sm uppercase animate-pulse">
                 Analyzing...
               </p>
             </div>
           </div>
        </div>
      )}
      
       {/* Viewfinder Grid */}
       <div className="absolute inset-0 pointer-events-none opacity-30 z-10">
        <div className="w-full h-full border-[1px] border-white/20 grid grid-cols-3 grid-rows-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="border-[0.5px] border-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

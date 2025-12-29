import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, ChevronRight } from 'lucide-react';
import { useSnapshots } from '@/hooks/use-camera-analysis';
import { formatDistanceToNow } from 'date-fns';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ isOpen, onClose }) => {
  const { data: snapshots, isLoading } = useSnapshots();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-white/10 z-50 shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
              <div>
                <h2 className="text-2xl font-display font-bold text-white">Shot History</h2>
                <p className="text-sm text-muted-foreground mt-1">Previous AI directions</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                </div>
              ) : snapshots?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No shots analyzed yet.</p>
                </div>
              ) : (
                snapshots?.map((shot) => (
                  <div 
                    key={shot.id}
                    className="group bg-secondary/50 hover:bg-secondary border border-white/5 hover:border-primary/50 rounded-xl p-4 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center shrink-0
                        ${shot.action === 'OK' ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'}
                      `}>
                        <span className="font-display font-bold text-xs">{shot.action}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium leading-relaxed">
                          {shot.advice}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                            {shot.createdAt ? formatDistanceToNow(new Date(shot.createdAt), { addSuffix: true }) : 'Just now'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

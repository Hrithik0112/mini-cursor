'use client';

import { useStore } from '@/lib/store';
import { CheckCircle2, Loader2, Circle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AgentLog() {
  const { agentLogOpen, setAgentLogOpen, agent } = useStore();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />;
      case 'running':
        return <Loader2 size={14} className="text-primary animate-spin flex-shrink-0" />;
      case 'error':
        return <X size={14} className="text-red-600 flex-shrink-0" />;
      default:
        return <Circle size={14} className="text-foreground/40 flex-shrink-0" />;
    }
  };

  if (!agentLogOpen) {
    return null;
  }

  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: 200 }}
      exit={{ height: 0 }}
      className="border-t border-border bg-secondary overflow-hidden"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/80">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Agent Log</h3>
        <button
          onClick={() => setAgentLogOpen(false)}
          className="p-1 hover:bg-primary/10 rounded transition-colors text-foreground/60 hover:text-foreground"
        >
          <X size={14} />
        </button>
      </div>
      <div className="h-[calc(200px-41px)] overflow-y-auto px-3 py-2 space-y-1.5">
        {agent.steps.length === 0 && (
          <div className="text-center text-foreground/40 text-xs py-8">
            No agent activity yet
          </div>
        )}
        <AnimatePresence>
          {agent.steps.map((step) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 text-xs"
            >
              {getStatusIcon(step.status)}
              <div className="flex-1 min-w-0">
                <div className="text-foreground/80">{step.name}</div>
                {step.message && (
                  <div className="text-xs text-foreground/50 mt-0.5">{step.message}</div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}


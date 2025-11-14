'use client';

import { useStore } from '@/lib/store';
import { CheckCircle2, Loader2, Circle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgentLog() {
  const { agentLogOpen, setAgentLogOpen, agent } = useStore();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="text-green-400" />;
      case 'running':
        return <Loader2 size={16} className="text-[var(--accent)] animate-spin" />;
      case 'error':
        return <X size={16} className="text-red-400" />;
      default:
        return <Circle size={16} className="text-gray-500" />;
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
      className="border-t border-[var(--border)] bg-[var(--sidebar-bg)] overflow-hidden"
    >
      <div className="flex items-center justify-between p-3 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Agent Log</h3>
        <button
          onClick={() => setAgentLogOpen(false)}
          className="p-1 hover:bg-[var(--border)] rounded transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <div className="h-[calc(200px-49px)] overflow-y-auto p-3 space-y-2">
        {agent.steps.length === 0 && (
          <div className="text-center text-gray-500 text-xs py-8">
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
              className="flex items-start gap-2 text-sm"
            >
              {getStatusIcon(step.status)}
              <div className="flex-1">
                <div className="text-[var(--foreground)]">{step.name}</div>
                {step.message && (
                  <div className="text-xs text-gray-400 mt-1">{step.message}</div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}


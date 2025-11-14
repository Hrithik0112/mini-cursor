'use client';

import { motion } from 'framer-motion';
import { Sparkles, Code, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIState, CodeEdit } from '@/lib/store';

interface MessagesAreaProps {
  ai: AIState;
  onApplyEdit: () => void;
  onDismissEdit: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function MessagesArea({ 
  ai, 
  onApplyEdit, 
  onDismissEdit,
  messagesEndRef 
}: MessagesAreaProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Context Section */}
      {ai.context.length > 0 && (
        <div className="p-4 border-b border-border bg-background/50">
          <div className="text-xs font-semibold text-aiPanel-text/70 uppercase tracking-wider mb-2">
            📌 Relevant Context (Mock)
          </div>
          {ai.context.map((ctx, idx) => (
            <div key={idx} className="text-xs text-aiPanel-text/80 mb-2 last:mb-0">
              <span className="text-primary">{ctx.file}</span>
              <span className="text-aiPanel-text/60 ml-2">
                (line {ctx.lineRange[0]}–{ctx.lineRange[1]})
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pending Edit Section */}
      {ai.pendingEdit && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-b border-border bg-green-500/10"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Code size={16} className="text-green-600" />
              <div className="text-sm font-semibold text-aiPanel-text">
                Code Edit Ready
              </div>
            </div>
            <button
              onClick={onDismissEdit}
              className="p-1 hover:bg-black/5 rounded transition-colors text-aiPanel-text/60"
            >
              <X size={14} />
            </button>
          </div>
          {ai.pendingEdit.description && (
            <p className="text-xs text-aiPanel-text/70 mb-3">{ai.pendingEdit.description}</p>
          )}
          <div className="text-xs text-aiPanel-text/80 mb-3 font-mono bg-background/50 p-2 rounded border border-border">
            <div className="text-red-600">- {ai.pendingEdit.oldText.split('\n')[0]}...</div>
            <div className="text-green-600">+ {ai.pendingEdit.newText.split('\n')[0]}...</div>
          </div>
          <button
            onClick={onApplyEdit}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Check size={16} />
            Apply Edit
          </button>
        </motion.div>
      )}

      {/* Messages */}
      <div className="p-4 space-y-4">
        {ai.messages.length === 0 && (
          <div className="text-center text-aiPanel-text/50 text-sm mt-8">
            <Sparkles size={32} className="mx-auto mb-2 opacity-30" />
            <p>Start a conversation</p>
          </div>
        )}
        {ai.messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex", message.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-lg p-3",
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background/70 border border-border text-aiPanel-text'
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {ai.isStreaming && (
          <div className="flex justify-start">
            <div className="bg-background/70 border border-border rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}


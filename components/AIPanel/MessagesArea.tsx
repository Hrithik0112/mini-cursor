'use client';

import { motion } from 'framer-motion';
import { Code, X, Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { AIState, CodeEdit } from '@/lib/store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessagesAreaProps {
  ai: AIState;
  onApplyEdit: () => void;
  onDismissEdit: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  inputSection?: React.ReactNode;
}

export default function MessagesArea({ 
  ai, 
  onApplyEdit, 
  onDismissEdit,
  messagesEndRef,
  inputSection
}: MessagesAreaProps) {
  const hasMessages = ai.messages.length > 0 || ai.context.length > 0 || ai.pendingEdit;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Group messages into pairs (user message + AI response)
  const messagePairs: Array<{
    userMessage: typeof ai.messages[0];
    aiResponse?: typeof ai.messages[0];
  }> = [];
  
  for (let i = 0; i < ai.messages.length; i++) {
    const message = ai.messages[i];
    if (message.role === 'user') {
      const aiResponse = ai.messages[i + 1]?.role === 'assistant' ? ai.messages[i + 1] : undefined;
      messagePairs.push({ userMessage: message, aiResponse });
      if (aiResponse) i++; // Skip the AI response as it's already paired
    }
  }
  
  return (
    <div className={cn("flex-1", !hasMessages && inputSection ? "flex flex-col overflow-hidden" : "overflow-y-auto scroll-smooth")}>

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
      {!hasMessages && inputSection ? (
        <div className="flex-1 flex flex-col">
          <div className="w-full max-w-full ">
            {inputSection}
          </div>
        </div>
      ) : (
        <div className="relative">
        {messagePairs.map((pair, pairIndex) => {
          const isLastPair = pairIndex === messagePairs.length - 1;
          
          return (
            <div 
              key={pair.userMessage.id}
              className={cn(
                isLastPair && 'sticky top-2 z-10 bg-aiPanel',
                !isLastPair && 'relative'
              )}
            >
              {/* User Message */}
              <div className="w-[calc(100%-1rem)] bg-muted/60 py-2 px-2 border border-border m-2">
                <div className="text-sm text-aiPanel-text whitespace-pre-wrap leading-relaxed">
                  {pair.userMessage.content}
                </div>
              </div>
              
              {/* AI Response */}
              {pair.aiResponse && (
                <div className="px-4 py-3 relative group bg-aiPanel">
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-aiPanel-text prose-p:text-aiPanel-text prose-strong:text-aiPanel-text prose-code:text-aiPanel-text prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: ({ inline, className, children, ...props }: any) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <pre className="bg-muted/50 border border-border rounded p-3 overflow-x-auto">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          ) : (
                            <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs" {...props}>
                              {children}
                            </code>
                          );
                        },
                        p: ({ children }: any) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                        ul: ({ children }: any) => <ul className="mb-3 last:mb-0 pl-4 list-disc">{children}</ul>,
                        ol: ({ children }: any) => <ol className="mb-3 last:mb-0 pl-4 list-decimal">{children}</ol>,
                        li: ({ children }: any) => <li className="mb-1">{children}</li>,
                        h1: ({ children }: any) => <h1 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h1>,
                        h2: ({ children }: any) => <h2 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h2>,
                        h3: ({ children }: any) => <h3 className="text-sm font-semibold mb-2 mt-2 first:mt-0">{children}</h3>,
                        blockquote: ({ children }: any) => <blockquote className="border-l-2 border-border pl-3 italic my-2">{children}</blockquote>,
                      }}
                    >
                      {pair.aiResponse.content}
                    </ReactMarkdown>
                  </div>
                  <button
                    onClick={() => handleCopy(pair.aiResponse!.content, pair.aiResponse!.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-muted/50 rounded text-aiPanel-text/60 hover:text-aiPanel-text"
                    title="Copy"
                  >
                    {copiedId === pair.aiResponse!.id ? (
                      <Check size={14} className="text-primary" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {ai.isStreaming && (
          <div className="px-4 py-3">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-aiPanel-text/40 rounded-full" />
              <div className="w-1.5 h-1.5 bg-aiPanel-text/40 rounded-full" />
              <div className="w-1.5 h-1.5 bg-aiPanel-text/40 rounded-full" />
            </div>
          </div>
        )}
        {/* Spacer to allow last message pair to scroll to top */}
        {messagePairs.length > 0 && (
          <div className="h-[calc(100vh-300px)]" />
        )}
        <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}


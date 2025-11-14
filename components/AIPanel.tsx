'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Send, X, Sparkles, Check, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockContextSearch } from '@/lib/mockRAG';
import { mockProject } from '@/lib/mockData';
import { generateMockEdit, applyCodeEdit } from '@/lib/codeEdit';
import { cn } from '@/lib/utils';

export default function AIPanel() {
  const {
    aiPanelOpen,
    setAIPanelOpen,
    ai,
    addAIMessage,
    updateLastAIMessage,
    setAIStreaming,
    setAIContext,
    setPendingEdit,
    addAgentStep,
    updateFileContent,
    openFile,
    setActiveFile,
    editor,
    updateAgentStep,
    setAgentRunning,
    resetAgent,
  } = useStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ai.messages]);

  const handleSend = async () => {
    if (!input.trim() || ai.isStreaming) return;

    const userMessage = input.trim();
    setInput('');
    addAIMessage('user', userMessage);
    setAIStreaming(true);
    resetAgent();
    setAgentRunning(true);

    // Start agent workflow
    const step1 = { id: '1', name: 'Analyzing the prompt...', status: 'running' as const };
    addAgentStep(step1);
    await new Promise((resolve) => setTimeout(resolve, 500));
    updateAgentStep('1', { status: 'completed' });

    // Mock context search
    const step2 = { id: '2', name: 'Searching relevant files...', status: 'running' as const };
    addAgentStep(step2);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const contextResults = mockContextSearch(userMessage, mockProject);
    setAIContext(contextResults);
    updateAgentStep('2', { status: 'completed' });

    // Create plan
    const step3 = { id: '3', name: 'Creating plan...', status: 'running' as const };
    addAgentStep(step3);
    await new Promise((resolve) => setTimeout(resolve, 600));
    updateAgentStep('3', { status: 'completed' });

    // Stream AI response using SSE
    const assistantMessageId = Date.now().toString();
    setCurrentMessageId(assistantMessageId);
    addAIMessage('assistant', '');

    try {
      const response = await fetch('/api/mockAI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                accumulatedContent += data.chunk;
                updateLastAIMessage(accumulatedContent);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
    }

    // Generate mock edit if applicable
    const mockEdit = generateMockEdit(userMessage);
    if (mockEdit) {
      setPendingEdit(mockEdit);
    }

    // Apply edits step
    const step4 = { id: '4', name: 'Preparing code edits...', status: 'running' as const };
    addAgentStep(step4);
    await new Promise((resolve) => setTimeout(resolve, 500));
    updateAgentStep('4', { status: 'completed' });

    // Done
    const step5 = { id: '5', name: 'Done.', status: 'completed' as const };
    addAgentStep(step5);
    setAgentRunning(false);
    setAIStreaming(false);
    setCurrentMessageId(null);
  };

  const handleApplyEdit = () => {
    if (!ai.pendingEdit) return;

    const edit = ai.pendingEdit;
    const currentContent = editor.fileContents[edit.file] || '';
    const newContent = applyCodeEdit(currentContent, edit.oldText, edit.newText);

    // Open file if not already open
    if (!editor.openFiles.includes(edit.file)) {
      openFile(edit.file);
    } else {
      setActiveFile(edit.file);
    }

    // Apply the edit
    updateFileContent(edit.file, newContent);
    setPendingEdit(null);

    // Add success message
    addAIMessage('assistant', '✅ Code edit applied successfully!');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!aiPanelOpen) {
    return (
      <button
        onClick={() => setAIPanelOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-l-lg transition-colors z-10"
      >
        <Sparkles size={20} />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: 400 }}
      exit={{ width: 0 }}
      className="h-full bg-aiPanel border-l border-border flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-aiPanel-text">New Chat</h2>
        <button
          onClick={() => setAIPanelOpen(false)}
          className="p-1 hover:bg-primary/10 rounded transition-colors text-aiPanel-text/60 hover:text-aiPanel-text"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages Area */}
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
                onClick={() => setPendingEdit(null)}
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
              onClick={handleApplyEdit}
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

      {/* Input Section */}
      <div className="p-4 border-t border-border space-y-2">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Plan, @ for context, / for commands"
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-aiPanel-text placeholder:text-aiPanel-text/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
            rows={2}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-aiPanel-text/60">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="text-lg">∞</span>
              <span>Agent</span>
            </span>
            <span>Auto</span>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || ai.isStreaming}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Send size={14} />
            Send
          </button>
        </div>
      </div>
    </motion.div>
  );
}


'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Send, X, Sparkles, Check, Code, AtSign, Globe, Image as ImageIcon, Mic, Folder, ChevronDown, Plus, Clock, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockContextSearch } from '@/lib/mockRAG';
import { mockProject } from '@/lib/mockData';
import { generateMockEdit, applyCodeEdit } from '@/lib/codeEdit';
import { cn } from '@/lib/utils';

export default function AIPanel() {
  const {
    aiPanelOpen,
    setAIPanelOpen,
    aiPanelWidth,
    setAIPanelWidth,
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
  const [agentMode, setAgentMode] = useState('Agent');
  const [autoMode, setAutoMode] = useState('Auto');
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ai.messages]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use requestAnimationFrame for smooth updates
      rafRef.current = requestAnimationFrame(() => {
        if (!panelRef.current) return;
        
        const newWidth = Math.max(300, window.innerWidth - e.clientX);
        
        // Direct DOM manipulation for immediate visual feedback
        panelRef.current.style.width = `${newWidth}px`;
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Final update to store on mouseup
      if (panelRef.current) {
        const finalWidth = Math.max(300, window.innerWidth - e.clientX);
        setAIPanelWidth(finalWidth);
      }
      
      setIsResizing(false);
      
      // Clean up
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'auto';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.pointerEvents = '';
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isResizing, setAIPanelWidth]);

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
      ref={panelRef}
      initial={{ width: aiPanelOpen ? aiPanelWidth : 0 }}
      animate={!isResizing ? { width: aiPanelOpen ? aiPanelWidth : 0 } : undefined}
      exit={{ width: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="h-full bg-aiPanel border-l border-border flex flex-col relative"
      style={{
        width: isResizing ? undefined : (aiPanelOpen ? aiPanelWidth : 0),
        willChange: isResizing ? 'width' : 'auto',
      }}
    >
      {/* Resize Handle */}
      <div
        ref={resizeRef}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize z-10 flex items-center justify-center"
      >
        <div
          className={cn(
            "h-full w-0.5 hover:w-1 hover:bg-primary/40 transition-all",
            isResizing && "w-1 bg-primary/60"
          )}
        />
      </div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="px-2.5 py-1 text-xs font-medium rounded bg-background/50 text-aiPanel-text/60">
              Build a minimalist
            </div>
            <div className="px-2.5 py-1 text-xs font-medium rounded bg-background/50 text-aiPanel-text/60">
              Create theme and
            </div>
            <div className="px-2.5 py-1 text-xs font-medium rounded bg-background text-aiPanel-text border border-border">
              New Chat
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-1.5 hover:bg-primary/10 rounded transition-colors text-aiPanel-text/60 hover:text-aiPanel-text"
          >
            <Plus size={16} />
          </button>
          <button
            className="p-1.5 hover:bg-primary/10 rounded transition-colors text-aiPanel-text/60 hover:text-aiPanel-text"
          >
            <Clock size={16} />
          </button>
          <button
            className="p-1.5 hover:bg-primary/10 rounded transition-colors text-aiPanel-text/60 hover:text-aiPanel-text"
          >
            <MoreVertical size={16} />
          </button>
          <button
            onClick={() => setAIPanelOpen(false)}
            className="p-1.5 hover:bg-primary/10 rounded transition-colors text-aiPanel-text/60 hover:text-aiPanel-text"
          >
            <X size={16} />
          </button>
        </div>
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
        <div className="relative bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Placeholder text area */}
          <div className="px-4 pt-4 pb-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Plan, @ for context, / for commands"
              className="w-full bg-transparent text-sm text-aiPanel-text placeholder:text-aiPanel-text/40 resize-none focus:outline-none min-h-[70px] leading-relaxed"
              rows={3}
            />
          </div>
          
          {/* Controls inside input */}
          <div className="px-4 pb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Agent selector */}
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/60 hover:bg-muted border border-border/60 text-xs font-medium text-aiPanel-text transition-colors">
                <span className="text-base leading-none">∞</span>
                <span>{agentMode}</span>
                <ChevronDown size={12} className="text-aiPanel-text/50" />
              </button>
              
              {/* Auto selector */}
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-muted/30 text-xs font-medium text-aiPanel-text/70 transition-colors">
                <span>{autoMode}</span>
                <ChevronDown size={12} className="text-aiPanel-text/50" />
              </button>
            </div>
            
            {/* Right side icons */}
            <div className="flex items-center gap-0.5">
              <button className="p-2 hover:bg-muted/50 rounded-lg transition-colors text-aiPanel-text/60 hover:text-aiPanel-text">
                <AtSign size={16} />
              </button>
              <button className="p-2 hover:bg-muted/50 rounded-lg transition-colors text-aiPanel-text/60 hover:text-aiPanel-text">
                <Globe size={16} />
              </button>
              <button className="p-2 hover:bg-muted/50 rounded-lg transition-colors text-aiPanel-text/60 hover:text-aiPanel-text">
                <ImageIcon size={16} />
              </button>
              <button className="p-2 bg-muted/60 hover:bg-muted rounded-lg transition-colors text-aiPanel-text">
                <Mic size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Local option */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors text-xs text-aiPanel-text/70 hover:text-aiPanel-text w-full">
          <Folder size={14} />
          <span>Local</span>
          <ChevronDown size={12} className="text-aiPanel-text/50 ml-auto" />
        </button>
      </div>
    </motion.div>
  );
}


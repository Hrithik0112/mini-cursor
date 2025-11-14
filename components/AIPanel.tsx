'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockContextSearch } from '@/lib/mockRAG';
import { mockProject } from '@/lib/mockData';
import { generateMockEdit, applyCodeEdit } from '@/lib/codeEdit';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import Header from './AIPanel/Header';
import MessagesArea from './AIPanel/MessagesArea';
import InputSection from './AIPanel/InputSection';

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
  
  // Dropdown and modal states
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [autoModalOpen, setAutoModalOpen] = useState(false);
  const [autoEnabled, setAutoEnabled] = useState(true);
  const [maxModeEnabled, setMaxModeEnabled] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Sonnet 4.5');
  
  const aiModels = [
    { name: 'Composer 1', hasIcon: false },
    { name: 'Sonnet 4.5', hasIcon: true },
    { name: 'GPT-5.1 Codex', hasIcon: true },
    { name: 'GPT-5.1', hasIcon: true },
    { name: 'GPT-5.1 Codex Mini', hasIcon: true },
    { name: 'Haiku 4.5', hasIcon: true },
    { name: 'Grok Code', hasIcon: true },
  ];
  const agentModes = ['Agent', 'Chat', 'Composer'];

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
    <TooltipProvider>
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
      <Header onClose={() => setAIPanelOpen(false)} />

      {(() => {
        const hasMessages = ai.messages.length > 0 || ai.context.length > 0 || ai.pendingEdit;
        const userMessageCount = ai.messages.filter(m => m.role === 'user').length;
        const isFirstMessage = userMessageCount === 1 && !ai.context.length && !ai.pendingEdit;
        const inputSection = (
          <motion.div
            layout
            initial={isFirstMessage ? { y: -100, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={isFirstMessage ? { type: "spring", stiffness: 300, damping: 30 } : { layout: { duration: 0.3 } }}
          >
            <InputSection
            input={input}
            onInputChange={setInput}
            onKeyPress={handleKeyPress}
            onSend={handleSend}
            isStreaming={ai.isStreaming}
            agentMode={agentMode}
            agentModes={agentModes}
            agentDropdownOpen={agentDropdownOpen}
            onAgentDropdownChange={setAgentDropdownOpen}
            onAgentModeSelect={setAgentMode}
            autoEnabled={autoEnabled}
            maxModeEnabled={maxModeEnabled}
            selectedModel={selectedModel}
            aiModels={aiModels}
            autoModalOpen={autoModalOpen}
            onAutoModalChange={setAutoModalOpen}
            onAutoToggle={(enabled) => {
              setAutoEnabled(enabled);
              if (!enabled) {
                setAutoMode(selectedModel);
              } else {
                setAutoMode('Auto');
              }
            }}
            onMaxModeToggle={setMaxModeEnabled}
            onModelSelect={(model) => {
              setSelectedModel(model);
              setAutoMode(model);
            }}
          />
          </motion.div>
        );

        return (
          <>
            <MessagesArea
              ai={ai}
              onApplyEdit={handleApplyEdit}
              onDismissEdit={() => setPendingEdit(null)}
              messagesEndRef={messagesEndRef}
              inputSection={!hasMessages ? inputSection : undefined}
            />
            {hasMessages && inputSection}
          </>
        );
      })()}

    </motion.div>
    </TooltipProvider>
  );
}


'use client';

import { useState, useRef } from 'react';
import { AtSign, Globe, Image as ImageIcon, Mic, Folder, ChevronDown, ArrowUp, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useStore } from '@/lib/store';
import AgentSelector from './AgentSelector';
import AutoSelector from './AutoSelector';
import MentionPopover, { getAllFiles } from './MentionPopover';
import type { FileNode } from '@/lib/store';

interface AIModel {
  name: string;
  hasIcon: boolean;
}

interface InputSectionProps {
  input: string;
  onInputChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  isStreaming: boolean;
  agentMode: string;
  agentModes: string[];
  agentDropdownOpen: boolean;
  onAgentDropdownChange: (open: boolean) => void;
  onAgentModeSelect: (mode: string) => void;
  autoEnabled: boolean;
  maxModeEnabled: boolean;
  selectedModel: string;
  aiModels: AIModel[];
  autoModalOpen: boolean;
  onAutoModalChange: (open: boolean) => void;
  onAutoToggle: (enabled: boolean) => void;
  onMaxModeToggle: (enabled: boolean) => void;
  onModelSelect: (model: string) => void;
}

export default function InputSection({
  input,
  onInputChange,
  onKeyPress,
  onSend,
  isStreaming,
  agentMode,
  agentModes,
  agentDropdownOpen,
  onAgentDropdownChange,
  onAgentModeSelect,
  autoEnabled,
  maxModeEnabled,
  selectedModel,
  aiModels,
  autoModalOpen,
  onAutoModalChange,
  onAutoToggle,
  onMaxModeToggle,
  onModelSelect,
}: InputSectionProps) {
  const { fileTree } = useStore();
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileNode[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionStartRef = useRef<number | null>(null);
  const mentionTriggerRef = useRef<HTMLDivElement>(null);

  const allFiles = getAllFiles(fileTree);

  const handleMentionSelect = (file: FileNode) => {
    if (mentionStartRef.current !== null && textareaRef.current) {
      // Remove the @ and query text from input
      const beforeMention = input.substring(0, mentionStartRef.current);
      const afterMention = input.substring(textareaRef.current.selectionStart);
      const newValue = `${beforeMention}${afterMention}`;
      onInputChange(newValue);
      
      // Add file to selected files if not already selected
      if (!selectedFiles.find(f => f.path === file.path)) {
        setSelectedFiles([...selectedFiles, file]);
      }
      
      setMentionOpen(false);
      mentionStartRef.current = null;
      
      // Focus back on textarea
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newCursorPos = beforeMention.length;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  const handleRemoveFile = (filePath: string) => {
    setSelectedFiles(selectedFiles.filter(f => f.path !== filePath));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    // Check if @ was just typed
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // Check if there's a space after @ (meaning mention is complete)
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        // Show mention popover
        mentionStartRef.current = lastAtIndex;
        setMentionQuery(textAfterAt);
        setMentionOpen(true);
      } else {
        setMentionOpen(false);
        mentionStartRef.current = null;
      }
    } else {
      setMentionOpen(false);
      mentionStartRef.current = null;
    }
    
    onInputChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionOpen) {
      if (e.key === 'Escape') {
        setMentionOpen(false);
        mentionStartRef.current = null;
        return;
      }
      
      if (e.key === 'Enter') {
        e.preventDefault();
        const filtered = allFiles.filter(file => 
          file.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
          file.path.toLowerCase().includes(mentionQuery.toLowerCase())
        );
        if (filtered.length > 0) {
          handleMentionSelect(filtered[0]);
        }
        return;
      }
      
      // Allow typing to continue updating the query
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
        // Let the onChange handler update the query
        return;
      }
    }
    
    onKeyPress(e);
  };

  return (
    <div className="p-2 space-y-2">
      <div className="relative bg-muted/50 border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Selected Files Chips */}
        {selectedFiles.length > 0 && (
          <div className="px-2 pt-2 pb-1 flex flex-wrap gap-1.5">
            {selectedFiles.map((file) => (
              <div
                key={file.path}
                className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md border border-primary/20"
              >
                <span className="truncate max-w-[200px]">{file.name}</span>
                <button
                  onClick={() => handleRemoveFile(file.path)}
                  className="flex-shrink-0 p-0.5 hover:bg-primary/20 rounded transition-colors"
                  type="button"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Placeholder text area */}
        <div className="px-2 pt-3 pb-1 relative">
          <div ref={mentionTriggerRef} className="fixed w-0 h-0 pointer-events-none" />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Plan, @ for context, / for commands"
            className="w-full bg-transparent text-sm text-aiPanel-text placeholder:text-aiPanel-text/40 resize-none focus:outline-none min-h-[50px] leading-relaxed"
            rows={2}
          />
        </div>
        
        {/* Mention Popover */}
        <MentionPopover
          open={mentionOpen}
          onOpenChange={setMentionOpen}
          files={allFiles}
          searchQuery={mentionQuery}
          onSelect={handleMentionSelect}
          triggerRef={mentionTriggerRef}
          textareaRef={textareaRef}
        />
        
        {/* Controls inside input */}
        <div className="px-2 pb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 relative">
            <AgentSelector
              agentMode={agentMode}
              agentModes={agentModes}
              open={agentDropdownOpen}
              onOpenChange={onAgentDropdownChange}
              onSelect={onAgentModeSelect}
            />
            
            <AutoSelector
              autoEnabled={autoEnabled}
              maxModeEnabled={maxModeEnabled}
              selectedModel={selectedModel}
              aiModels={aiModels}
              open={autoModalOpen}
              onOpenChange={onAutoModalChange}
              onAutoToggle={onAutoToggle}
              onMaxModeToggle={onMaxModeToggle}
              onModelSelect={onModelSelect}
            />
          </div>
          
          {/* Right side icons */}
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 hover:bg-background/50 rounded-lg transition-colors text-aiPanel-text/60 hover:text-aiPanel-text">
                  <AtSign size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mention</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 hover:bg-background/50 rounded-lg transition-colors text-aiPanel-text/60 hover:text-aiPanel-text">
                  <Globe size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Web search</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 hover:bg-background/50 rounded-lg transition-colors text-aiPanel-text/60 hover:text-aiPanel-text">
                  <ImageIcon size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Attach image</p>
              </TooltipContent>
            </Tooltip>
            {input.trim() ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onSend}
                    disabled={!input.trim() || isStreaming}
                    className="p-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-primary-foreground"
                  >
                    <ArrowUp size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2 bg-background/60 hover:bg-background/80 rounded-lg transition-colors text-aiPanel-text">
                    <Mic size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Voice input</p>
                </TooltipContent>
              </Tooltip>
            )}
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
  );
}


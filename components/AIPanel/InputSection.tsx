'use client';

import { AtSign, Globe, Image as ImageIcon, Mic, Folder, ChevronDown, ArrowUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AgentSelector from './AgentSelector';
import AutoSelector from './AutoSelector';

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
  return (
    <div className="p-4 space-y-2">
      <div className="relative bg-muted/50 border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Placeholder text area */}
        <div className="px-4 pt-3 pb-1">
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Plan, @ for context, / for commands"
            className="w-full bg-transparent text-sm text-aiPanel-text placeholder:text-aiPanel-text/40 resize-none focus:outline-none min-h-[50px] leading-relaxed"
            rows={2}
          />
        </div>
        
        {/* Controls inside input */}
        <div className="px-4 pb-3 flex items-center justify-between gap-2">
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


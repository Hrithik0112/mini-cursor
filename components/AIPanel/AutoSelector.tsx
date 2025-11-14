'use client';

import { useState } from 'react';
import { ChevronDown, Search, Brain, Check, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AIModel {
  name: string;
  hasIcon: boolean;
}

interface AutoSelectorProps {
  autoEnabled: boolean;
  maxModeEnabled: boolean;
  selectedModel: string;
  aiModels: AIModel[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAutoToggle: (enabled: boolean) => void;
  onMaxModeToggle: (enabled: boolean) => void;
  onModelSelect: (model: string) => void;
}

export default function AutoSelector({
  autoEnabled,
  maxModeEnabled,
  selectedModel,
  aiModels,
  open,
  onOpenChange,
  onAutoToggle,
  onMaxModeToggle,
  onModelSelect,
}: AutoSelectorProps) {
  const [modelSearch, setModelSearch] = useState('');

  const filteredModels = aiModels.filter(model => 
    model.name.toLowerCase().includes(modelSearch.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-background/30 text-xs font-medium text-aiPanel-text/70 transition-colors"
        >
          <span>{autoEnabled ? 'Auto' : selectedModel}</span>
          <ChevronDown size={12} className="text-aiPanel-text/50" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        sideOffset={4}
        align="start"
        className="w-[180px] p-0 bg-background border border-border rounded-lg shadow-xl"
      >
        {/* Search Bar */}
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-aiPanel-text/40" />
            <input
              type="text"
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              placeholder="Search models"
              className="w-full pl-6 pr-2 py-1.5 bg-muted/30 border border-border rounded text-[12px] text-aiPanel-text placeholder:text-aiPanel-text/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
        
        {/* Toggle Switches */}
        <div className="p-2 border-b border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-aiPanel-text font-medium">Auto</span>
            <button
              type="button"
              onClick={() => onAutoToggle(!autoEnabled)}
              className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-primary/20",
                autoEnabled ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                  autoEnabled ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-aiPanel-text font-medium">MAX Mode</span>
            <button
              type="button"
              onClick={() => onMaxModeToggle(!maxModeEnabled)}
              className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-primary/20",
                maxModeEnabled ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                  maxModeEnabled ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
        </div>
        
        {/* Model List */}
        {!autoEnabled && (
          <div className="max-h-[240px] overflow-y-auto">
            {filteredModels.length > 0 ? (
              <div className="py-1">
                {filteredModels.map((model) => (
                  <button
                    key={model.name}
                    onClick={() => {
                      onModelSelect(model.name);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "w-full px-2.5 py-1.5 text-left text-xs text-aiPanel-text hover:bg-muted/50 transition-colors flex items-center justify-between",
                      selectedModel === model.name && "bg-primary/10"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {model.hasIcon && (
                        <Brain size={12} className="text-aiPanel-text/60" />
                      )}
                      <span className={cn(
                        selectedModel === model.name && "text-primary font-medium"
                      )}>
                        {model.name}
                      </span>
                    </div>
                    {selectedModel === model.name && (
                      <Check size={14} className="text-primary" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center text-xs text-aiPanel-text/60">
                No models found
              </div>
            )}
          </div>
        )}
        
        {/* Add Models */}
        {!autoEnabled && (
          <div className="p-2 border-t border-border">
            <button className="w-full px-2.5 py-1.5 text-left text-xs text-aiPanel-text hover:bg-muted/50 rounded transition-colors flex items-center justify-between">
              <span>Add Models</span>
              <ChevronRight size={14} className="text-aiPanel-text/40" />
            </button>
          </div>
        )}
        
        {/* Description when Auto is enabled */}
        {autoEnabled && (
          <div className="p-2">
            <p className="text-xs text-aiPanel-text/60 leading-relaxed">
              Balanced quality and speed, recommended for most tasks
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}


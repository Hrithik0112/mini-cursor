'use client';

import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AgentSelectorProps {
  agentMode: string;
  agentModes: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (mode: string) => void;
}

export default function AgentSelector({
  agentMode,
  agentModes,
  open,
  onOpenChange,
  onSelect,
}: AgentSelectorProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background/60 hover:bg-background/80 border border-border/60 text-xs font-medium text-aiPanel-text transition-colors"
        >
          <span className="text-base leading-none">∞</span>
          <span>{agentMode}</span>
          <ChevronDown size={12} className="text-aiPanel-text/50" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        sideOffset={4}
        align="start"
        className="w-[120px] p-1 bg-background border border-border rounded-lg shadow-lg"
      >
        {agentModes.map((mode) => (
          <button
            key={mode}
            onClick={() => {
              onSelect(mode);
              onOpenChange(false);
            }}
            className={cn(
              "w-full px-3 py-2 text-left text-xs text-aiPanel-text hover:bg-muted/50 transition-colors rounded-lg",
              agentMode === mode && "bg-primary/10 text-primary font-medium"
            )}
          >
            {mode}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}


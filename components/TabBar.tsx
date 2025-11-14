'use client';

import { useStore } from '@/lib/store';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TabBar() {
  const { editor, closeFile, setActiveFile } = useStore();
  const { openFiles, activeFile } = editor;

  if (openFiles.length === 0) {
    return null;
  }

  return (
    <div className="flex items-end gap-0 bg-secondary border-b border-border px-1 overflow-x-auto">
      {openFiles.map((path) => {
        const fileName = path.split('/').pop() || path;
        const isActive = path === activeFile;

        return (
          <div
            key={path}
            onClick={() => setActiveFile(path)}
            className={cn(
              "group flex items-center gap-1.5 px-3 py-2 cursor-pointer transition-colors relative",
              isActive 
                ? "bg-background text-foreground" 
                : "text-foreground/60 hover:text-foreground hover:bg-primary/5"
            )}
          >
            <span className="text-xs whitespace-nowrap font-medium">{fileName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFile(path);
              }}
              className={cn(
                "p-0.5 rounded transition-all hover:bg-primary/10 ml-1",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              <X size={11} className="text-foreground/60" />
            </button>
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
            )}
          </div>
        );
      })}
    </div>
  );
}


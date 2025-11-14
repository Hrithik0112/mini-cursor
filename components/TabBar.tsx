'use client';

import { useStore } from '@/lib/store';
import { X } from 'lucide-react';

export default function TabBar() {
  const { editor, closeFile, setActiveFile } = useStore();
  const { openFiles, activeFile } = editor;

  if (openFiles.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 bg-[var(--sidebar-bg)] border-b border-[var(--border)] px-2 overflow-x-auto">
      {openFiles.map((path) => {
        const fileName = path.split('/').pop() || path;
        const isActive = path === activeFile;

        return (
          <div
            key={path}
            onClick={() => setActiveFile(path)}
            className={`
              flex items-center gap-2 px-3 py-2 cursor-pointer rounded-t transition-colors
              ${isActive ? 'bg-[var(--background)] border-t-2 border-[var(--accent)]' : 'hover:bg-[var(--border)]'}
            `}
          >
            <span className="text-sm text-[var(--foreground)] whitespace-nowrap">{fileName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFile(path);
              }}
              className="p-0.5 hover:bg-[var(--border)] rounded transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}


'use client';

import { useEffect, useRef } from 'react';
import { File, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { FileNode } from '@/lib/store';

interface MentionPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: FileNode[];
  searchQuery: string;
  onSelect: (file: FileNode) => void;
  triggerRef: React.RefObject<HTMLDivElement>;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

// Helper function to extract all files from file tree
export function getAllFiles(node: FileNode): FileNode[] {
  const files: FileNode[] = [];
  
  // Only add files (not directories)
  if (!node.isDirectory) {
    files.push(node);
  }
  
  // Recursively process children
  if (node.children) {
    for (const child of node.children) {
      files.push(...getAllFiles(child));
    }
  }
  
  return files;
}

export default function MentionPopover({
  open,
  onOpenChange,
  files,
  searchQuery,
  onSelect,
  triggerRef,
  textareaRef,
}: MentionPopoverProps) {
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update trigger position based on cursor
  useEffect(() => {
    if (open && textareaRef.current && triggerRef.current) {
      const updatePosition = () => {
        if (!textareaRef.current || !triggerRef.current) return;
        
        const textarea = textareaRef.current;
        const rect = textarea.getBoundingClientRect();
        
        // Get cursor position
        const selectionStart = textarea.selectionStart;
        const textBeforeCursor = textarea.value.substring(0, selectionStart);
        
        // Find the last @ symbol
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        if (lastAtIndex === -1) return;
        
        // Create a temporary span to measure text position
        const tempSpan = document.createElement('span');
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.position = 'absolute';
        tempSpan.style.whiteSpace = 'pre-wrap';
        tempSpan.style.font = window.getComputedStyle(textarea).font;
        tempSpan.style.paddingLeft = window.getComputedStyle(textarea).paddingLeft;
        tempSpan.style.paddingRight = window.getComputedStyle(textarea).paddingRight;
        tempSpan.textContent = textBeforeCursor.substring(0, lastAtIndex);
        document.body.appendChild(tempSpan);
        
        const spanWidth = tempSpan.offsetWidth;
        document.body.removeChild(tempSpan);
        
        // Calculate position relative to textarea
        const lineHeight = parseFloat(window.getComputedStyle(textarea).lineHeight) || 20;
        const lines = textBeforeCursor.substring(0, lastAtIndex).split('\n').length;
        const top = (lines - 1) * lineHeight;
        const left = spanWidth;
        
        // Update trigger position
        triggerRef.current.style.top = `${rect.top + top}px`;
        triggerRef.current.style.left = `${rect.left + left}px`;
      };
      
      updatePosition();
      
      // Update on scroll and resize
      const handleUpdate = () => updatePosition();
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);
      
      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [open, searchQuery, triggerRef, textareaRef]);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div ref={triggerRef} className="fixed w-0 h-0 pointer-events-none" />
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] p-0 bg-background border border-border rounded-lg shadow-xl"
        align="start"
        side="top"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-aiPanel-text/40" />
            <div className="pl-6 pr-2 py-1.5 text-xs text-aiPanel-text">
              {searchQuery || 'Search files...'}
            </div>
          </div>
        </div>
        
        <div className="max-h-[240px] overflow-y-auto">
          {filteredFiles.length > 0 ? (
            <div className="py-1">
              {filteredFiles.slice(0, 10).map((file) => (
                <button
                  key={file.path}
                  onClick={() => onSelect(file)}
                  className="w-full px-2.5 py-2 text-left text-xs text-aiPanel-text hover:bg-muted/50 transition-colors flex items-center gap-2"
                >
                  <File size={12} className="text-aiPanel-text/60 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{file.name}</div>
                    <div className="text-[10px] text-aiPanel-text/50 truncate">{file.path}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-aiPanel-text/60">
              No files found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}


'use client';

import { FileNode, useStore } from '@/lib/store';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FileIcon } from '@/lib/fileIcons';

interface FileTreeItemProps {
  node: FileNode;
  level?: number;
}

function FileTreeItem({ node, level = 0 }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const { openFile, editor } = useStore();
  const { activeFile } = editor;
  const isActive = activeFile === node.path;

  const handleClick = () => {
    if (node.isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      openFile(node.path);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 cursor-pointer transition-colors rounded-sm",
          "hover:bg-primary/10",
          isActive && "bg-primary/15 text-foreground"
        )}
        style={{ paddingLeft: `${8 + level * 16}px` }}
      >
        {node.isDirectory ? (
          <>
            <ChevronRight
              size={12}
              className={cn(
                "transition-transform text-foreground/50 flex-shrink-0",
                isExpanded && "rotate-90"
              )}
            />
            <FileIcon name={node.name} isDirectory isExpanded={isExpanded} size={14} />
          </>
        ) : (
          <div className="ml-4">
            <FileIcon name={node.name} size={14} />
          </div>
        )}
        <span className={cn(
          "text-sm truncate",
          isActive ? "text-foreground font-medium" : "text-foreground/70"
        )}>
          {node.name}
        </span>
      </div>
      <AnimatePresence>
        {node.isDirectory && isExpanded && node.children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children.map((child) => (
              <FileTreeItem key={child.path} node={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FileTree() {
  const { fileTree } = useStore();

  return (
    <div className="h-full flex flex-col bg-secondary border-r border-border">
      {/* Title Header */}
      <div className="px-4 py-2.5 border-b border-border bg-secondary/80">
        <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          MINI-CURSOR
        </h2>
      </div>
      
      {/* File Tree Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-1">
          <FileTreeItem node={fileTree} />
        </div>
      </div>
    </div>
  );
}


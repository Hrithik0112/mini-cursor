'use client';

import { FileNode, useStore } from '@/lib/store';
import { ChevronRight, File, Folder } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
        className={`
          flex items-center gap-1 px-2 py-1 cursor-pointer rounded
          hover:bg-[var(--border)] transition-colors
          ${isActive ? 'bg-[var(--accent)]/20' : ''}
        `}
        style={{ paddingLeft: `${8 + level * 16}px` }}
      >
        {node.isDirectory ? (
          <>
            <ChevronRight
              size={14}
              className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
            <Folder size={14} className="text-blue-400" />
          </>
        ) : (
          <File size={14} className="text-gray-400 ml-4" />
        )}
        <span className="text-sm text-[var(--foreground)]">{node.name}</span>
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
    <div className="h-full overflow-y-auto bg-[var(--sidebar-bg)] border-r border-[var(--border)]">
      <div className="p-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
          Files
        </div>
        <FileTreeItem node={fileTree} />
      </div>
    </div>
  );
}


'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { mockProject } from '@/lib/mockData';
import FileTree from '@/components/FileTree';
import CodeEditor from '@/components/CodeEditor';
import AIPanel from '@/components/AIPanel';
import AgentLog from '@/components/AgentLog';
import TabBar from '@/components/TabBar';
import { isModKey } from '@/lib/keyboard';

export default function Home() {
  const { setFileTree, aiPanelOpen, setAIPanelOpen } = useStore();

  useEffect(() => {
    // Initialize mock file tree
    setFileTree(mockProject);
  }, [setFileTree]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K to toggle AI panel
      if (isModKey(e) && e.key === 'k') {
        e.preventDefault();
        setAIPanelOpen(!aiPanelOpen);
      }
      
      // Escape to close AI panel
      if (e.key === 'Escape' && aiPanelOpen) {
        setAIPanelOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aiPanelOpen, setAIPanelOpen]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Tree */}
        <div className="w-64 flex-shrink-0">
          <FileTree />
        </div>

        {/* Center - Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <TabBar />
          <div className="flex-1 overflow-hidden">
            <CodeEditor />
          </div>
          <AgentLog />
        </div>

        {/* Right Sidebar - AI Panel */}
        <AIPanel />
      </div>
    </div>
  );
}


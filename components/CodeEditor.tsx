'use client';

import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '@/lib/store';
import { mockProject, getFileContent } from '@/lib/mockData';
import * as monaco from 'monaco-editor';
import { FileText, FolderOpen } from 'lucide-react';

export default function CodeEditor() {
  const { editor, updateFileContent } = useStore();
  const { activeFile, fileContents } = editor;
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const content = activeFile
    ? fileContents[activeFile] ?? getFileContent(mockProject, activeFile) ?? ''
    : '';

  useEffect(() => {
    // Initialize file contents from mock data
    const initializeFiles = () => {
      const files: Record<string, string> = {};
      
      function traverse(node: typeof mockProject) {
        if (!node.isDirectory && node.content) {
          files[node.path] = node.content;
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      }
      
      traverse(mockProject);
      
      Object.entries(files).forEach(([path, content]) => {
        if (!fileContents[path]) {
          updateFileContent(path, content);
        }
      });
    };

    initializeFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      updateFileContent(activeFile, value);
    }
  };

  const getLanguage = (path: string | null): string => {
    if (!path) return 'plaintext';
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript';
    if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript';
    if (path.endsWith('.json')) return 'json';
    return 'plaintext';
  };

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No file selected
          </h3>
          <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
            Select a file from the sidebar to start editing, or use the file explorer to navigate your project.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-foreground/50">
            <FolderOpen size={14} />
            <span>Browse files in the left sidebar</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background">
      <div className="h-full">
        <Editor
          height="100%"
          language={getLanguage(activeFile)}
          value={content}
          theme="vs"
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            fontSize: 13,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            fontFamily: 'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
            fontLigatures: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            padding: { top: 8, bottom: 8 },
            lineHeight: 20,
            letterSpacing: 0.3,
          }}
        />
      </div>
    </div>
  );
}


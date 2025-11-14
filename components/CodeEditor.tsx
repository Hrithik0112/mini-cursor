'use client';

import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '@/lib/store';
import { mockProject, getFileContent } from '@/lib/mockData';
import * as monaco from 'monaco-editor';

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
      <div className="h-full flex items-center justify-center bg-[var(--background)] text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No file selected</p>
          <p className="text-sm">Open a file from the sidebar to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--background)]">
      <div className="h-full">
        <Editor
          height="100%"
          language={getLanguage(activeFile)}
          value={content}
          theme="vs-dark"
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
}


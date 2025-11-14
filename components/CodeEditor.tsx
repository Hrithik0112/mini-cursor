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
  const markerDisposableRef = useRef<monaco.IDisposable | null>(null);

  const content = activeFile
    ? fileContents[activeFile] ?? getFileContent(mockProject, activeFile) ?? ''
    : '';

  useEffect(() => {
    // Completely disable ALL diagnostics FIRST (before any other config)
    // Also explicitly ignore common error codes as a fallback
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,  // Disable all semantic validation
      noSyntaxValidation: true,    // Disable all syntax validation
      noSuggestionDiagnostics: true, // Disable suggestion diagnostics
      // Explicitly ignore common error codes (fallback in case validation isn't fully disabled)
      diagnosticCodesToIgnore: [
        7027, // Unreachable code detected
        2307, // Cannot find module
        2304, // Cannot find name
        2552, // Cannot find name (for global types)
        2580, // Cannot find name (for global types)
        2588, // Cannot find name (for global types)
        1109, // Expression expected
        1005, // ';' expected
        1128, // Declaration or statement expected
      ],
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,  // Disable all semantic validation
      noSyntaxValidation: true,    // Disable all syntax validation
      noSuggestionDiagnostics: true, // Disable suggestion diagnostics
      // Explicitly ignore common error codes (fallback in case validation isn't fully disabled)
      diagnosticCodesToIgnore: [
        7027, // Unreachable code detected
        2307, // Cannot find module
        2304, // Cannot find name
        2552, // Cannot find name (for global types)
        2580, // Cannot find name (for global types)
        2588, // Cannot find name (for global types)
        1109, // Expression expected
        1005, // ';' expected
        1128, // Declaration or statement expected
      ],
    });

    // Configure Monaco TypeScript compiler options (but validation is already disabled)
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
      skipLibCheck: true,
      // Disable all strict checks
      noUnusedLocals: false,
      noUnusedParameters: false,
      noImplicitAny: false,
      allowUnreachableCode: true, // Allow unreachable code
      allowUnusedLabels: true,
    });

    // Configure JavaScript defaults as well
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
      skipLibCheck: true,
      allowUnreachableCode: true, // Allow unreachable code
      allowUnusedLabels: true,
    });

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

  // Clear markers whenever active file changes
  useEffect(() => {
    if (editorRef.current && activeFile) {
      const model = editorRef.current.getModel();
      if (model) {
        // Clear all markers when switching files
        monaco.editor.setModelMarkers(model, 'typescript', []);
        monaco.editor.setModelMarkers(model, 'javascript', []);
      }
    }
  }, [activeFile]);

  // Cleanup marker listener on unmount
  useEffect(() => {
    return () => {
      if (markerDisposableRef.current) {
        markerDisposableRef.current.dispose();
      }
    };
  }, []);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    // Ensure all diagnostics are disabled after editor mounts
    // This is a fallback to make sure no errors show up
    setTimeout(() => {
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
        noSuggestionDiagnostics: true,
        diagnosticCodesToIgnore: [
          7027, // Unreachable code detected
          2307, // Cannot find module
          2304, // Cannot find name
          2552, 2580, 2588, // Cannot find name variants
          1109, 1005, 1128, // Syntax errors
        ],
      });
      
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
        noSuggestionDiagnostics: true,
        diagnosticCodesToIgnore: [
          7027, // Unreachable code detected
          2307, // Cannot find module
          2304, // Cannot find name
          2552, 2580, 2588, // Cannot find name variants
          1109, 1005, 1128, // Syntax errors
        ],
      });
      
      // Clear any existing markers
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelMarkers(model, 'typescript', []);
        monaco.editor.setModelMarkers(model, 'javascript', []);
        
        // Dispose previous listener if it exists
        if (markerDisposableRef.current) {
          markerDisposableRef.current.dispose();
        }
        
        // Set up a listener to immediately clear any markers that appear
        markerDisposableRef.current = monaco.editor.onDidChangeMarkers((uris) => {
          // Check if the current model is in the list of changed URIs
          if (uris.some(uri => uri.toString() === model.uri.toString())) {
            // Clear all markers for this model immediately
            monaco.editor.setModelMarkers(model, 'typescript', []);
            monaco.editor.setModelMarkers(model, 'javascript', []);
          }
        });
      }
    }, 100);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      updateFileContent(activeFile, value);
      
      // Clear any error markers that might appear
      if (editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          // Clear markers after a short delay to ensure they're cleared
          setTimeout(() => {
            monaco.editor.setModelMarkers(model, 'typescript', []);
            monaco.editor.setModelMarkers(model, 'javascript', []);
          }, 50);
        }
      }
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
            // Disable error markers and validation in editor
            renderValidationDecorations: 'off',
            glyphMargin: false,
            folding: true,
            showFoldingControls: 'always',
          }}
        />
      </div>
    </div>
  );
}


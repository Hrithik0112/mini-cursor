import { create } from 'zustand';

export interface FileNode {
  name: string;
  path: string;
  content?: string;
  children?: FileNode[];
  isDirectory: boolean;
}

export interface EditorState {
  openFiles: string[];
  activeFile: string | null;
  fileContents: Record<string, string>;
}

export interface CodeEdit {
  file: string;
  oldText: string;
  newText: string;
  description?: string;
}

export interface AIState {
  isStreaming: boolean;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  context: Array<{
    file: string;
    lines: string;
    lineRange: [number, number];
  }>;
  pendingEdit: CodeEdit | null;
}

export interface AgentState {
  isRunning: boolean;
  steps: Array<{
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    message?: string;
  }>;
}

interface AppState {
  // File system
  fileTree: FileNode;
  editor: EditorState;
  
  // AI
  ai: AIState;
  
  // Agent
  agent: AgentState;
  
  // UI
  aiPanelOpen: boolean;
  agentLogOpen: boolean;
  aiPanelWidth: number;
  
  // Actions
  setFileTree: (tree: FileNode) => void;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
  setAIPanelOpen: (open: boolean) => void;
  setAgentLogOpen: (open: boolean) => void;
  setAIPanelWidth: (width: number) => void;
  addAIMessage: (role: 'user' | 'assistant', content: string) => void;
  updateLastAIMessage: (content: string) => void;
  setAIStreaming: (streaming: boolean) => void;
  setAIContext: (context: AIState['context']) => void;
  setPendingEdit: (edit: CodeEdit | null) => void;
  addAgentStep: (step: AgentState['steps'][0]) => void;
  updateAgentStep: (id: string, updates: Partial<AgentState['steps'][0]>) => void;
  setAgentRunning: (running: boolean) => void;
  resetAgent: () => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  fileTree: {
    name: 'root',
    path: '/',
    isDirectory: true,
    children: [],
  },
  editor: {
    openFiles: [],
    activeFile: null,
    fileContents: {},
  },
  ai: {
    isStreaming: false,
    messages: [],
    context: [],
    pendingEdit: null,
  },
  agent: {
    isRunning: false,
    steps: [],
  },
  aiPanelOpen: true,
  agentLogOpen: true,
  aiPanelWidth: 400,
  
  // Actions
  setFileTree: (tree) => set({ fileTree: tree }),
  
  openFile: (path) =>
    set((state) => {
      if (state.editor.openFiles.includes(path)) {
        return { editor: { ...state.editor, activeFile: path } };
      }
      return {
        editor: {
          ...state.editor,
          openFiles: [...state.editor.openFiles, path],
          activeFile: path,
        },
      };
    }),
  
  closeFile: (path) =>
    set((state) => {
      const newOpenFiles = state.editor.openFiles.filter((f) => f !== path);
      const newActiveFile =
        state.editor.activeFile === path
          ? newOpenFiles[newOpenFiles.length - 1] || null
          : state.editor.activeFile;
      return {
        editor: {
          ...state.editor,
          openFiles: newOpenFiles,
          activeFile: newActiveFile,
        },
      };
    }),
  
  setActiveFile: (path) =>
    set((state) => ({
      editor: { ...state.editor, activeFile: path },
    })),
  
  updateFileContent: (path, content) =>
    set((state) => ({
      editor: {
        ...state.editor,
        fileContents: { ...state.editor.fileContents, [path]: content },
      },
    })),
  
  setAIPanelOpen: (open) => set({ aiPanelOpen: open }),
  setAgentLogOpen: (open) => set({ agentLogOpen: open }),
  setAIPanelWidth: (width) => set({ aiPanelWidth: Math.max(300, width) }),
  
  addAIMessage: (role, content) =>
    set((state) => ({
      ai: {
        ...state.ai,
        messages: [
          ...state.ai.messages,
          {
            id: Date.now().toString(),
            role,
            content,
            timestamp: Date.now(),
          },
        ],
      },
    })),
  
  updateLastAIMessage: (content) =>
    set((state) => {
      const messages = [...state.ai.messages];
      const lastIndex = messages.length - 1;
      if (lastIndex >= 0 && messages[lastIndex].role === 'assistant') {
        messages[lastIndex] = {
          ...messages[lastIndex],
          content,
        };
      }
      return {
        ai: {
          ...state.ai,
          messages,
        },
      };
    }),
  
  setAIStreaming: (streaming) =>
    set((state) => ({
      ai: { ...state.ai, isStreaming: streaming },
    })),
  
  setAIContext: (context) =>
    set((state) => ({
      ai: { ...state.ai, context },
    })),
  
  setPendingEdit: (edit) =>
    set((state) => ({
      ai: { ...state.ai, pendingEdit: edit },
    })),
  
  addAgentStep: (step) =>
    set((state) => ({
      agent: {
        ...state.agent,
        steps: [...state.agent.steps, step],
      },
    })),
  
  updateAgentStep: (id, updates) =>
    set((state) => ({
      agent: {
        ...state.agent,
        steps: state.agent.steps.map((step) =>
          step.id === id ? { ...step, ...updates } : step
        ),
      },
    })),
  
  setAgentRunning: (running) =>
    set((state) => ({
      agent: { ...state.agent, isRunning: running },
    })),
  
  resetAgent: () =>
    set({
      agent: {
        isRunning: false,
        steps: [],
      },
    }),
}));


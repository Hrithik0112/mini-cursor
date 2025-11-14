import { FileNode } from './store';

export const mockProject: FileNode = {
  name: 'mini-cursor',
  path: '/',
  isDirectory: true,
  children: [
    {
      name: 'app',
      path: '/app',
      isDirectory: true,
      children: [
        {
          name: 'layout.tsx',
          path: '/app/layout.tsx',
          isDirectory: false,
          content: `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Cursor",
  description: "A minimalist Cursor clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
        },
        {
          name: 'page.tsx',
          path: '/app/page.tsx',
          isDirectory: false,
          content: `'use client';

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
    setFileTree(mockProject);
  }, [setFileTree]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModKey(e) && e.key === 'k') {
        e.preventDefault();
        setAIPanelOpen(!aiPanelOpen);
      }
      
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
        <div className="w-64 flex-shrink-0">
          <FileTree />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <TabBar />
          <div className="flex-1 overflow-hidden">
            <CodeEditor />
          </div>
          <AgentLog />
        </div>

        <AIPanel />
      </div>
    </div>
  );
}`,
        },
        {
          name: 'globals.css',
          path: '/app/globals.css',
          isDirectory: false,
          content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  --border: 214.3 31.8% 91.4%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --secondary: 217.2 32.6% 17.5%;
  --border: 217.2 32.6% 17.5%;
}

body {
  color: hsl(var(--foreground));
  background: hsl(var(--background));
}`,
        },
        {
          name: 'api',
          path: '/app/api',
          isDirectory: true,
          children: [
            {
              name: 'mockAI',
              path: '/app/api/mockAI',
              isDirectory: true,
              children: [
                {
                  name: 'route.ts',
                  path: '/app/api/mockAI/route.ts',
                  isDirectory: false,
                  content: `import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { message } = await request.json();
  
  // Mock AI response
  return NextResponse.json({
    response: \`You said: \${message}\`,
  });
}`,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'components',
      path: '/components',
      isDirectory: true,
      children: [
        {
          name: 'AIPanel.tsx',
          path: '/components/AIPanel.tsx',
          isDirectory: false,
          content: `'use client';

// Main AI Panel component
export default function AIPanel() {
  return (
    <div className="w-96 border-l border-border bg-secondary">
      <h2>AI Panel</h2>
    </div>
  );
}`,
        },
        {
          name: 'FileTree.tsx',
          path: '/components/FileTree.tsx',
          isDirectory: false,
          content: `'use client';

import { FileNode, useStore } from '@/lib/store';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FileIcon } from '@/lib/fileIcons';

// FileTree component implementation
export default function FileTree() {
  const { fileTree } = useStore();
  return <div>File Tree</div>;
}`,
        },
        {
          name: 'CodeEditor.tsx',
          path: '/components/CodeEditor.tsx',
          isDirectory: false,
          content: `'use client';

import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '@/lib/store';

export default function CodeEditor() {
  const { editor } = useStore();
  return <div>Code Editor</div>;
}`,
        },
        {
          name: 'ui',
          path: '/components/ui',
          isDirectory: true,
          children: [
            {
              name: 'dropdown-menu.tsx',
              path: '/components/ui/dropdown-menu.tsx',
              isDirectory: false,
              content: `'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
// ... more exports`,
            },
            {
              name: 'popover.tsx',
              path: '/components/ui/popover.tsx',
              isDirectory: false,
              content: `'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
// ... more exports`,
            },
          ],
        },
      ],
    },
    {
      name: 'lib',
      path: '/lib',
      isDirectory: true,
      children: [
        {
          name: 'store.ts',
          path: '/lib/store.ts',
          isDirectory: false,
          content: `import { create } from 'zustand';

export interface FileNode {
  name: string;
  path: string;
  content?: string;
  children?: FileNode[];
  isDirectory: boolean;
}

export const useStore = create((set) => ({
  fileTree: { name: 'root', path: '/', isDirectory: true, children: [] },
  // ... more state
}));`,
        },
        {
          name: 'utils.ts',
          path: '/lib/utils.ts',
          isDirectory: false,
          content: `import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,
        },
        {
          name: 'fileIcons.tsx',
          path: '/lib/fileIcons.tsx',
          isDirectory: false,
          content: `import { File, FileCode, FileJson, Folder, FolderOpen, LucideIcon } from 'lucide-react';

export function FileIcon({ name, isDirectory, isExpanded }: FileIconProps) {
  // File icon implementation
  return null;
}`,
        },
      ],
    },
    {
      name: 'public',
      path: '/public',
      isDirectory: true,
      children: [
        {
          name: 'favicon.ico',
          path: '/public/favicon.ico',
          isDirectory: false,
          content: '',
        },
      ],
    },
    {
      name: '.gitignore',
      path: '/.gitignore',
      isDirectory: false,
      content: `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts`,
    },
    {
      name: 'next.config.js',
      path: '/next.config.js',
      isDirectory: false,
      content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;`,
    },
    {
      name: 'tailwind.config.ts',
      path: '/tailwind.config.ts',
      isDirectory: false,
      content: `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;`,
    },
    {
      name: 'tsconfig.json',
      path: '/tsconfig.json',
      isDirectory: false,
      content: `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,
    },
    {
      name: 'package.json',
      path: '/package.json',
      isDirectory: false,
      content: `{
  "name": "mini-cursor",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@monaco-editor/react": "^4.6.0",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "framer-motion": "^11.3.19",
    "lucide-react": "^0.427.0",
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwindcss": "^3.4.7",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/node": "^20.14.12",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.5",
    "postcss": "^8.4.40",
    "typescript": "^5.5.4"
  }
}`,
    },
    {
      name: 'README.md',
      path: '/README.md',
      isDirectory: false,
      content: `# Mini Cursor

A minimalist Cursor clone built with Next.js, TypeScript, and Tailwind CSS.

## Features

- File tree navigation
- Code editor with Monaco
- AI-powered assistance
- Modern UI with Tailwind CSS

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the app.`,
    },
  ],
};

// Helper function to get file content from tree
export function getFileContent(tree: FileNode, path: string): string | null {
  if (tree.path === path && !tree.isDirectory) {
    return tree.content || '';
  }
  
  if (tree.children) {
    for (const child of tree.children) {
      const result = getFileContent(child, path);
      if (result !== null) return result;
    }
  }
  
  return null;
}


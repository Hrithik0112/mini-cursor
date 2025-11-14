import { FileNode } from './store';

export const mockProject: FileNode = {
  name: 'root',
  path: '/',
  isDirectory: true,
  children: [
    {
      name: 'src',
      path: '/src',
      isDirectory: true,
      children: [
        {
          name: 'index.ts',
          path: '/src/index.ts',
          isDirectory: false,
          content: `console.log('Hello world');

function greet(name: string) {
  return \`Hello, \${name}!\`;
}

export default greet;`,
        },
        {
          name: 'utils.ts',
          path: '/src/utils.ts',
          isDirectory: false,
          content: `export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}`,
        },
        {
          name: 'api.ts',
          path: '/src/api.ts',
          isDirectory: false,
          content: `import { add, multiply } from './utils';

export async function calculateTotal(items: number[]) {
  let total = 0;
  for (const item of items) {
    total = add(total, item);
  }
  return multiply(total, 1.1); // Add 10% tax
}`,
        },
      ],
    },
    {
      name: 'package.json',
      path: '/package.json',
      isDirectory: false,
      content: `{
  "name": "demo",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc"
  },
  "dependencies": {
    "typescript": "^5.0.0"
  }
}`,
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


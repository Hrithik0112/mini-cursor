import {
  File,
  FileCode,
  FileJson,
  FileText,
  Image,
  FileType,
  Settings,
  Package,
  Lock,
  Folder,
  FolderOpen,
  LucideIcon,
} from 'lucide-react';
import { ReactNode } from 'react';

export interface FileIconProps {
  name: string;
  isDirectory?: boolean;
  isExpanded?: boolean;
  size?: number;
  className?: string;
}

// Map file extensions to icons
const getFileIcon = (fileName: string): LucideIcon => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const name = fileName.toLowerCase();

  // Configuration files
  if (name === 'package.json' || name === 'package-lock.json' || name === 'pnpm-lock.yaml' || name === 'yarn.lock') {
    return Package;
  }
  if (name === 'tsconfig.json' || name === 'jsconfig.json') {
    return Settings;
  }
  if (name === '.gitignore' || name === '.env' || name === '.env.local' || name === '.env.production') {
    return Lock;
  }
  if (name === 'next.config.js' || name === 'next.config.ts' || name === 'next.config.mjs') {
    return Settings;
  }
  if (name === 'tailwind.config.js' || name === 'tailwind.config.ts') {
    return Settings;
  }
  if (name === 'postcss.config.js' || name === 'postcss.config.ts') {
    return Settings;
  }
  if (name === 'components.json') {
    return Settings;
  }

  // Code files
  if (['ts', 'tsx'].includes(ext)) {
    return FileCode;
  }
  if (['js', 'jsx', 'mjs', 'cjs'].includes(ext)) {
    return FileCode;
  }
  if (ext === 'json') {
    return FileJson;
  }
  if (['css', 'scss', 'sass', 'less'].includes(ext)) {
    return FileType;
  }
  if (['html', 'htm'].includes(ext)) {
    return FileCode;
  }
  if (['md', 'mdx', 'markdown'].includes(ext)) {
    return FileText;
  }
  if (['svg', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico'].includes(ext)) {
    return Image;
  }
  if (['yml', 'yaml'].includes(ext)) {
    return FileText;
  }
  if (ext === 'txt') {
    return FileText;
  }

  // Default
  return File;
};

export function FileIcon({ name, isDirectory, isExpanded, size = 14, className }: FileIconProps): ReactNode {
  if (isDirectory) {
    const Icon = isExpanded ? FolderOpen : Folder;
    return <Icon size={size} className={className || 'text-blue-500 flex-shrink-0'} />;
  }

  const Icon = getFileIcon(name);
  const iconColor = getIconColor(name);
  
  return <Icon size={size} className={className || iconColor} />;
}

// Get color for file icon based on file type (matching VSCode colors)
function getIconColor(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const name = fileName.toLowerCase();

  // TypeScript - blue
  if (['ts', 'tsx'].includes(ext)) {
    return 'text-blue-500 flex-shrink-0';
  }
  
  // JavaScript - yellow
  if (['js', 'jsx', 'mjs', 'cjs'].includes(ext)) {
    return 'text-yellow-500 flex-shrink-0';
  }
  
  // JSON - yellow/orange
  if (ext === 'json' || name.includes('package.json') || name.includes('tsconfig')) {
    return 'text-yellow-600 flex-shrink-0';
  }
  
  // CSS - blue
  if (['css', 'scss', 'sass', 'less'].includes(ext)) {
    return 'text-blue-400 flex-shrink-0';
  }
  
  // HTML - orange
  if (['html', 'htm'].includes(ext)) {
    return 'text-orange-500 flex-shrink-0';
  }
  
  // Markdown - gray
  if (['md', 'mdx', 'markdown'].includes(ext)) {
    return 'text-gray-400 flex-shrink-0';
  }
  
  // Images - green
  if (['svg', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico'].includes(ext)) {
    return 'text-green-500 flex-shrink-0';
  }
  
  // Config files - gray
  if (name.includes('config') || name.includes('.env') || name.includes('.gitignore')) {
    return 'text-gray-500 flex-shrink-0';
  }
  
  // Default - gray
  return 'text-foreground/50 flex-shrink-0';
}


import { FileNode } from './store';
import { mockProject } from './mockData';

export interface ContextMatch {
  file: string;
  lines: string;
  lineRange: [number, number];
  score: number;
}

export function mockContextSearch(query: string, project: FileNode = mockProject): ContextMatch[] {
  const results: ContextMatch[] = [];
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(/\s+/).filter(k => k.length > 2);

  function searchInNode(node: FileNode, path: string = '') {
    const currentPath = path ? `${path}/${node.name}` : node.name;

    if (!node.isDirectory && node.content) {
      const lines = node.content.split('\n');
      let score = 0;
      const matchedLines: number[] = [];

      lines.forEach((line, index) => {
        const lineLower = line.toLowerCase();
        keywords.forEach((keyword) => {
          if (lineLower.includes(keyword)) {
            score += 1;
            matchedLines.push(index + 1);
          }
        });
      });

      if (score > 0) {
        const startLine = Math.max(1, Math.min(...matchedLines) - 2);
        const endLine = Math.min(lines.length, Math.max(...matchedLines) + 2);
        const relevantLines = lines.slice(startLine - 1, endLine).join('\n');

        results.push({
          file: currentPath.startsWith('/') ? currentPath : `/${currentPath}`,
          lines: relevantLines,
          lineRange: [startLine, endLine],
          score,
        });
      }
    }

    if (node.children) {
      node.children.forEach((child) => {
        searchInNode(child, currentPath);
      });
    }
  }

  searchInNode(project);

  // Sort by score and return top 3
  return results.sort((a, b) => b.score - a.score).slice(0, 3);
}


// Simple code edit application without external diff library for now
// In production, you'd use a proper diff/merge library

export interface CodeEdit {
  file: string;
  oldText: string;
  newText: string;
  description?: string;
}

export function applyCodeEdit(
  currentContent: string,
  oldText: string,
  newText: string
): string {
  // Simple replacement - in a real implementation, you'd use AST or more sophisticated diff
  if (currentContent.includes(oldText)) {
    return currentContent.replace(oldText, newText);
  }
  
  // Fallback: try to find similar text (normalize whitespace)
  const normalizedOld = oldText.replace(/\s+/g, ' ').trim();
  const normalizedContent = currentContent.replace(/\s+/g, ' ');
  
  if (normalizedContent.includes(normalizedOld)) {
    // Find the position and replace
    const index = normalizedContent.indexOf(normalizedOld);
    const before = currentContent.substring(0, index);
    const after = currentContent.substring(index + oldText.length);
    return before + newText + after;
  }
  
  // Last resort: append
  return currentContent + '\n\n' + newText;
}

export function generateMockEdit(prompt: string): CodeEdit | null {
  // Mock edit generator based on common prompts
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('refactor') || lowerPrompt.includes('add') || lowerPrompt.includes('function')) {
    return {
      file: '/src/utils.ts',
      oldText: `export function add(a: number, b: number): number {
  return a + b;
}`,
      newText: `export function add(a: number, b: number): number {
  // Added type safety
  return Number(a) + Number(b);
}`,
      description: 'Refactored add function with improved type safety',
    };
  }
  
  if (lowerPrompt.includes('fix') || lowerPrompt.includes('bug')) {
    return {
      file: '/src/api.ts',
      oldText: `  let total = 0;
  for (const item of items) {
    total = add(total, item);
  }`,
      newText: `  let total = 0;
  for (const item of items) {
    total = add(total, item);
  }
  // Fixed: handle empty array case`,
      description: 'Fixed edge case for empty arrays',
    };
  }
  
  return null;
}


export function isMac() {
  if (typeof window === 'undefined') return false;
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

export function getModKey(): string {
  return isMac() ? '⌘' : 'Ctrl';
}

export function isModKey(e: KeyboardEvent | React.KeyboardEvent): boolean {
  return isMac() ? e.metaKey : e.ctrlKey;
}


let pending: string | null = null;

export function armChapter(id: string): void {
  pending = id;
}

export function takeChapter(): string | null {
  const id = pending;
  pending = null;
  return id;
}

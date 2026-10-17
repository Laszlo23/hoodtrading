let pending: string | null = null;

export function armNote(slug: string): void {
  pending = slug;
}

export function takeNote(): string | null {
  const slug = pending;
  pending = null;
  return slug;
}

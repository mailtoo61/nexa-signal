export interface CopyResult {
  copied: boolean;
}

export async function copyText(text: string): Promise<CopyResult> {
  const nav = globalThis.navigator as
    | { clipboard?: { writeText: (value: string) => Promise<void> } }
    | undefined;
  if (nav?.clipboard?.writeText) {
    await nav.clipboard.writeText(text);
    return { copied: true };
  }
  return { copied: false };
}

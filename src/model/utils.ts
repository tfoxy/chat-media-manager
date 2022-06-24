export function basename(path: string): string {
  return path.split(/[\\/]/).pop() ?? "";
}

export function extname(path: string): string {
  const match = path.match(/\.[^.]*?$/);
  return match?.[0] ?? "";
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, -5).replace("T", " ");
}

export function extractNumberFromJid(jid: string): string {
  return jid.match(/(\d+)(?:@|-)/)?.[1] ?? "Unknown";
}

export function isWaGroup(jid: string): boolean {
  return jid.endsWith("@g.us");
}

export function isWaContact(jid: string): boolean {
  return jid.endsWith("@s.whatsapp.net");
}

/**
 * Taken from https://en.wikipedia.org/wiki/Filename#Reserved_characters_and_words
 */
export function escapeInvalidFilenameCharacters(filename: string): string {
  return filename
    .replace(/\//g, "⧸")
    .replace(/\\/g, "⧹")
    .replace(/\?/g, "ʔ")
    .replace(/%/g, "％")
    .replace(/\*/g, "∗")
    .replace(/:/g, "꞉")
    .replace(/"/g, "ʺ")
    .replace(/\|/g, "ǀ")
    .replace(/~/g, "∼")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
}

export function basename(path: string): string {
  return path.split(/[\\/]/).pop() ?? "";
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, -5).replace("T", " ");
}

export function extractNumberFromJid(jid: string): string {
  return jid.match(/(\d+)(?:@|-)/)?.[1] ?? "Unknown";
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

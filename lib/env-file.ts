export type EnvEntry = { key: string; value: string };

/**
 * Parses .env text into key/value entries. Handles `KEY=value`, an optional
 * `export ` prefix, blank lines, and full-line `#` comments. Values may be
 * single- or double-quoted; double-quoted values unescape \\, \" and \n.
 * Inline `#` is NOT treated as a comment, so secret values may contain it.
 * Later duplicates win (dotenv behavior).
 */
export function parseEnv(input: string): EnvEntry[] {
  const result = new Map<string, string>();

  for (const rawLine of input.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const withoutExport = line.startsWith("export ")
      ? line.slice("export ".length).trim()
      : line;

    const eq = withoutExport.indexOf("=");
    if (eq === -1) continue;

    const key = withoutExport.slice(0, eq).trim();
    if (!key) continue;

    let value = withoutExport.slice(eq + 1).trim();

    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
      value = value
        .slice(1, -1)
        .replace(/\\(["\\n])/g, (_, c: string) => (c === "n" ? "\n" : c));
    } else if (
      value.length >= 2 &&
      value.startsWith("'") &&
      value.endsWith("'")
    ) {
      value = value.slice(1, -1);
    }

    result.set(key, value);
  }

  return Array.from(result, ([key, value]) => ({ key, value }));
}

function formatValue(value: string): string {
  if (value === "" || /[\s#"']/.test(value)) {
    const escaped = value
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n");
    return `"${escaped}"`;
  }
  return value;
}

/** Serializes entries back into .env text (round-trips with parseEnv). */
export function serializeEnv(entries: EnvEntry[]): string {
  return entries.map(({ key, value }) => `${key}=${formatValue(value)}`).join("\n") + "\n";
}

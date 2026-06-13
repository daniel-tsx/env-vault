import { describe, expect, test } from "vitest";
import { parseEnv, serializeEnv, type EnvEntry } from "./env-file";

describe("parseEnv", () => {
  test("parses simple pairs and ignores comments/blank lines", () => {
    const out = parseEnv("# comment\n\nFOO=bar\nBAZ=qux\n");
    expect(out).toEqual([
      { key: "FOO", value: "bar" },
      { key: "BAZ", value: "qux" },
    ]);
  });

  test("handles the export prefix", () => {
    expect(parseEnv("export TOKEN=abc")).toEqual([
      { key: "TOKEN", value: "abc" },
    ]);
  });

  test("keeps '=' and '#' inside values", () => {
    expect(parseEnv("URL=postgres://a=b#c")).toEqual([
      { key: "URL", value: "postgres://a=b#c" },
    ]);
  });

  test("strips single and double quotes", () => {
    expect(parseEnv(`A="hello world"\nB='single'`)).toEqual([
      { key: "A", value: "hello world" },
      { key: "B", value: "single" },
    ]);
  });

  test("unescapes \\n and \\\" inside double quotes", () => {
    expect(parseEnv('KEY="line1\\nline2 \\"q\\""')).toEqual([
      { key: "KEY", value: 'line1\nline2 "q"' },
    ]);
  });

  test("later duplicates win", () => {
    expect(parseEnv("K=1\nK=2")).toEqual([{ key: "K", value: "2" }]);
  });
});

describe("serializeEnv + round-trip", () => {
  test("quotes only when necessary", () => {
    expect(serializeEnv([{ key: "A", value: "simple" }])).toBe("A=simple\n");
    expect(serializeEnv([{ key: "A", value: "two words" }])).toBe(
      'A="two words"\n'
    );
    expect(serializeEnv([{ key: "A", value: "" }])).toBe('A=""\n');
  });

  test("round-trips tricky values losslessly", () => {
    const entries: EnvEntry[] = [
      { key: "PLAIN", value: "abc123" },
      { key: "BASE64", value: "aGVsbG8=" },
      { key: "SPACED", value: " leading and trailing " },
      { key: "QUOTED", value: 'has "quotes" and \\ backslash' },
      { key: "MULTILINE", value: "line1\nline2" },
      { key: "HASHY", value: "#not-a-comment" },
      { key: "EMPTY", value: "" },
    ];
    expect(parseEnv(serializeEnv(entries))).toEqual(entries);
  });
});

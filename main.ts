// The 3 AM Excuse — make.fun entry.
// A hardware wallet refuses to sign at 3 a.m. The program writes the
// excuse verbatim to /output/entry.txt, after checking it against the
// sealed gate: UTF-8 text, 1 to 200 characters, not only whitespace.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const EXCUSE =
  "It's 3 a.m. I'm not signing this — my seed phrase is asleep, and your 'urgent' trade can wait for sunlight.";

const OUTPUT_PATH = "/output/entry.txt";
const MAX_CHARS = 200;
const EXPECTED_CHARS = 107;

function checkLine(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`excuse must be 1-${MAX_CHARS} characters, got ${chars}`);
  }
  if (chars !== EXPECTED_CHARS) {
    throw new Error(`excuse must be exactly ${EXPECTED_CHARS} characters, got ${chars}`);
  }
  // The excuse uses plain ASCII apostrophes (U+0027). A curly quote
  // would change the bytes the judge sees and break the verbatim match.
  if (text.includes("\u2018") || text.includes("\u2019")) {
    throw new Error("excuse must use plain ASCII apostrophes, not curly quotes");
  }
  // The em dash is intentional (U+2014) and counts as one character.
  if (!text.includes("\u2014")) {
    throw new Error("excuse is missing its em dash");
  }
  if (text.trim().length === 0) {
    throw new Error("excuse must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("excuse must be a single line");
  }
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code < 0x20 || code === 0x7f) {
      throw new Error(`excuse contains a control character U+${code.toString(16)}`);
    }
  }
}

checkLine(EXCUSE);

mkdirSync("/output", { recursive: true });
writeFileSync(OUTPUT_PATH, EXCUSE, "utf8");

const written = readFileSync(OUTPUT_PATH, "utf8");
if (written !== EXCUSE) {
  throw new Error("read-back mismatch: /output/entry.txt differs from the excuse");
}
if (written.endsWith("\n")) {
  throw new Error("entry.txt must not end with a trailing newline");
}
const bytes = Buffer.byteLength(written, "utf8");
console.log(`wrote ${[...written].length} characters (${bytes} bytes) to ${OUTPUT_PATH}`);

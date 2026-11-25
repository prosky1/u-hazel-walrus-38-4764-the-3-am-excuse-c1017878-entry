// The 3 AM Excuse — make.fun entry.
// The excuse, in the voice of someone who sleep-signs: a signature given
// half-asleep approved a rug pull, so nothing gets signed before breakfast.
// This program writes the excuse verbatim to /output/entry.txt, after
// checking it against the sealed gate: UTF-8 text, 1 to 200 characters,
// a single line, not only whitespace.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const EXCUSE =
  "I sleep-sign. My last signature approved a rug pull. Ask me again after breakfast.";

const OUTPUT_PATH = "/output/entry.txt";
const MAX_CHARS = 200;
const EXPECTED_CHARS = 82;

function checkLine(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`excuse must be 1-${MAX_CHARS} characters, got ${chars}`);
  }
  if (chars !== EXPECTED_CHARS) {
    throw new Error(`excuse must be exactly ${EXPECTED_CHARS} characters, got ${chars}`);
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
// The excuse is plain ASCII: every character must be printable ASCII,
// so no stray Unicode can sneak in between the constant and the file.
if ([...written].length !== EXPECTED_CHARS) {
  throw new Error(
    `entry.txt must be exactly ${EXPECTED_CHARS} characters, got ${[...written].length}`,
  );
}
for (const ch of written) {
  const code = ch.charCodeAt(0);
  if (code < 0x20 || code > 0x7e) {
    throw new Error(`entry.txt contains a non-ASCII character U+${code.toString(16)}`);
  }
}
const bytes = Buffer.byteLength(written, "utf8");
console.log(`wrote ${[...written].length} characters (${bytes} bytes) to ${OUTPUT_PATH}`);

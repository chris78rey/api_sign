export function guessPdfPageCount(pdfBytes: Buffer): number {
  const text = pdfBytes.toString('latin1');
  const matches = text.match(/\/Type\s*\/Page\b/g);
  const count = matches ? matches.length : 0;
  return Math.max(1, count);
}

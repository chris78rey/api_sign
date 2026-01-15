import { promises as fs } from 'fs';

import { guessPdfPageCount } from './pdfPageCount';

export async function pickDefaultCoordinates(pdfPath: string): Promise<{ x: number; y: number; page: number }> {
  const bytes = await fs.readFile(pdfPath);
  const pages = guessPdfPageCount(bytes);

  return {
    x: 50,
    y: 50,
    page: pages,
  };
}

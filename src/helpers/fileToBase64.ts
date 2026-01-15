import { promises as fs } from 'fs';

export async function fileToBase64(filePath: string): Promise<string> {
  const data = await fs.readFile(filePath);
  return data.toString('base64');
}

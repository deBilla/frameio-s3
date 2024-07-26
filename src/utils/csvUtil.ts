import { writeFileSync } from 'fs';

export class CSVUtil<T> {
  public createCSVFromMap(map: Map<string, T>, filePath: string): void {
    // Define CSV headers
    const headers = 'MediaKey,Exists';
    const rows = Array.from(map, ([key, value]) => `${key},${value}`).join('\n');
    const csvContent = `${headers}\n${rows}`;
    writeFileSync(filePath, csvContent);
  }
}
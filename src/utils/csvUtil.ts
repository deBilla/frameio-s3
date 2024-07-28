import { writeFileSync } from 'fs';

export class CSVUtil {
  public createCSVFromMap(map: Map<string, any>, filePath: string): void {
    // Define CSV headers
    const headers = 'MediaKey,AssetID,Exists';
    const rows = Array.from(map, ([key, value]) => `${key},${value.assetId},${value.exists}`).join('\n');
    const csvContent = `${headers}\n${rows}`;
    writeFileSync(filePath, csvContent);
  }
}
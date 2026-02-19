export enum GeneratorCategory {
  STANDARD = 'STANDARD',
  SECURITY = 'SECURITY',
  ANOMALY = 'ANOMALY',
  DATA = 'DATA',
  ARCHIVE = 'ARCHIVE',
  AI = 'AI',
  CHAOS = 'CHAOS'
}

export enum ImageFormat {
  PNG = 'image/png',
  JPEG = 'image/jpeg',
  WEBP = 'image/webp',
  GIF = 'image/gif',
  SVG = 'image/svg+xml',
  BMP = 'image/bmp'
}

export enum FilenamePattern {
  STANDARD = 'STANDARD',
  PATH_TRAVERSAL = 'PATH_TRAVERSAL', // ../../../image.png
  NULL_BYTE = 'NULL_BYTE', // image.png%00.php
  DOUBLE_EXTENSION = 'DOUBLE_EXTENSION', // image.php.png
  SHELL_INJECTION = 'SHELL_INJECTION', // image;sleep 10;.png
  XSS_FILENAME = 'XSS_FILENAME', // <script>alert(1)</script>.png
  LONG_NAME = 'LONG_NAME', // AAAA... .png
  WHITESPACE = 'WHITESPACE' // " image .png "
}

export interface GenerationSettings {
  width: number;
  height: number;
  color: string;
  text: string;
  format: ImageFormat;
  fileName: string;
  filenamePattern: FilenamePattern;
  
  // Security specific
  payloadType?: 'XSS_ALERT' | 'XSS_REMOTE' | 'XXE_BASIC' | 'XXE_OOB' | 'XXE_BILLION_LAUGHS' | 'POLYGLOT_JS' | 'METADATA_XSS' | 'PHP_SHELL_GIF' | 'ASPX_SHELL' | 'JSP_SHELL';
  
  // Data/CSV specific
  dataPayloadType?: 'CSV_DDE_EXCEL' | 'CSV_FORMULA_INJECTION' | 'CSV_GOOGLE_SHEETS' | 'JSON_HUGE_NESTING';

  // Archive specific
  archiveType?: 'ZIP_SLIP' | 'ZIP_BOMB_FLAT';

  // Anomaly specific
  anomalyType?: 'FAKE_HUGE' | 'EICAR_APPEND' | 'CORRUPT_HEADER' | 'TRUNCATED_FILE' | 'GARBAGE_CONTENT';
  
  // AI specific
  prompt?: string;
}

export interface GeneratedFile {
  id: string;
  name: string;
  url: string;
  blob: Blob;
  size: number;
  type: string;
  timestamp: number;
}

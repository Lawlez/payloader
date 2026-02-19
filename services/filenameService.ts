import { FilenamePattern } from '../types';

export const applyFilenamePattern = (baseName: string, extension: string, pattern: FilenamePattern): string => {
  const cleanExt = extension.replace('.', '');
  
  switch (pattern) {
    case FilenamePattern.PATH_TRAVERSAL:
      return `../../../etc/passwd/${baseName}.${cleanExt}`;
    
    case FilenamePattern.NULL_BYTE:
      return `${baseName}.${cleanExt}%00.php`;
      
    case FilenamePattern.DOUBLE_EXTENSION:
      return `${baseName}.php.${cleanExt}`;
      
    case FilenamePattern.SHELL_INJECTION:
      return `${baseName};sleep 10;.${cleanExt}`;
      
    case FilenamePattern.XSS_FILENAME:
      return `<img src=x onerror=alert(1)>.${cleanExt}`;
      
    case FilenamePattern.LONG_NAME:
      return `${baseName}_${'A'.repeat(200)}.${cleanExt}`;

    case FilenamePattern.WHITESPACE:
      return `  ${baseName}  .${cleanExt}  `;

    case FilenamePattern.STANDARD:
    default:
      return `${baseName}.${cleanExt}`;
  }
};

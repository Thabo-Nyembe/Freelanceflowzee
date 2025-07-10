// Browser compatibility utilities

// Polyfill for Object.fromEntries (IE support)
if (!Object.fromEntries) {
  Object.fromEntries = function(entries) {
    const obj = {};
    for (const [key, value] of entries) {
      obj[key] = value;
    }
    return obj;
  };
}

// Polyfill for String.replaceAll
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(search, replace) {
    return this.split(search).join(replace);
  };
}

// Feature detection utilities
export const browserSupport = {
  // Check for modern features
  supportsOptionalChaining: (() => {
    try {
      return typeof ({}?.test) !== 'undefined';
    } catch {
      return false;
    }
  })(),
  
  supportsNullishCoalescing: (() => {
    try {
      return (null ?? 'test') === 'test';
    } catch {
      return false;
    }
  })(),
  
  supportsWebP: (() => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('webp') > -1;
  }),
  
  supportsCSSGrid: CSS.supports('display', 'grid'),
  supportsFlexbox: CSS.supports('display', 'flex')
};

// Safe feature usage
export function safeOptionalChaining(obj: unknown, path: unknown, fallback = undefined: unknown) {
  if (browserSupport.supportsOptionalChaining) {
    try {
      return eval(`obj${path}`);
    } catch {
      return fallback;
    }
  }
  
  // Fallback for older browsers
  const keys = path.replace(/[?.]/, '').split('.');
  let result = obj;
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return fallback;
    }
  }
  return result;
}
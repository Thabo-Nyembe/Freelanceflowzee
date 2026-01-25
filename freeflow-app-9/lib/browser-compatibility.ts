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

// Safe feature usage - always use safe path traversal (never eval)
export function safeOptionalChaining(obj: unknown, path: string, fallback: unknown = undefined): unknown {
  if (!obj || typeof obj !== 'object') {
    return fallback;
  }

  // Safe path traversal without eval
  const keys = path.replace(/^\??\.?/, '').split(/[?.]+/).filter(Boolean);
  let result: unknown = obj;
  for (const key of keys) {
    if (result && typeof result === 'object' && key in (result as Record<string, unknown>)) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return fallback;
    }
  }
  return result;
}
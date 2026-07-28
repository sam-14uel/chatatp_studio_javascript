export function getThemeVariables(themePrimary: string, themeSecondary: string, themeMode: 'light' | 'dark' | 'system' = 'light') {
  const namedColors: Record<string, string> = {
    black: '#000000', white: '#ffffff', red: '#ef4444', orange: '#f97316', amber: '#f59e0b',
    yellow: '#eab308', green: '#22c55e', emerald: '#10b981', teal: '#14b8a6', cyan: '#06b6d4',
    sky: '#0ea5e9', blue: '#3b82f6', indigo: '#6366f1', violet: '#8b5cf6', purple: '#a855f7',
    pink: '#ec4899', rose: '#f43f5e', gray: '#64748b', slate: '#475569'
  };

  const normalizeColor = (color: string, fallback: string) => namedColors[color?.toLowerCase?.()] || color || fallback;

  const colorToRgb = (color: string, fallback: string) => {
    const normalized = normalizeColor(color, fallback).trim();
    const rgbMatch = normalized.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbMatch) return `${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}`;
    if (/^#[0-9a-f]{3}$/i.test(normalized)) {
      return `${parseInt(normalized[1] + normalized[1], 16)}, ${parseInt(normalized[2] + normalized[2], 16)}, ${parseInt(normalized[3] + normalized[3], 16)}`;
    }
    if (/^#[0-9a-f]{6}$/i.test(normalized)) {
      return `${parseInt(normalized.substring(1, 3), 16)}, ${parseInt(normalized.substring(3, 5), 16)}, ${parseInt(normalized.substring(5, 7), 16)}`;
    }
    return colorToRgb(fallback, '#0ea5e9');
  };

  const primary = normalizeColor(themePrimary, '#0ea5e9');
  const secondary = normalizeColor(themeSecondary, '#6366f1');
  const primaryRgb = colorToRgb(primary, '#0ea5e9');
  const secondaryRgb = colorToRgb(secondary, '#6366f1');

  const dark = themeMode === 'dark';
  const surface = dark ? '#0f172a' : '#ffffff';
  const surfaceAlt = dark ? '#111827' : '#f8fafc';
  const foreground = dark ? '#f8fafc' : '#0f172a';
  const mutedForeground = dark ? '#cbd5e1' : '#64748b';
  const borderRgb = dark ? '51, 65, 85' : '226, 232, 240';
  const cardRgb = dark ? '15, 23, 42' : '255, 255, 255';

  return `
    --chatatp-primary: ${primary};
    --chatatp-primary-rgb: ${primaryRgb};
    --chatatp-secondary: ${secondary};
    --chatatp-secondary-rgb: ${secondaryRgb};
    
    --chatatp-background: color-mix(in srgb, var(--chatatp-secondary) ${dark ? '18%' : '14%'}, ${surface});
    --chatatp-foreground: ${foreground};
    --chatatp-card: color-mix(in srgb, var(--chatatp-secondary) ${dark ? '20%' : '12%'}, ${surface});
    --chatatp-card-rgb: ${cardRgb};
    --chatatp-card-foreground: ${foreground};
    --chatatp-popover: color-mix(in srgb, var(--chatatp-secondary) ${dark ? '24%' : '10%'}, ${surface});
    --chatatp-popover-foreground: ${foreground};
    --chatatp-primary-foreground: #f8fafc;
    --chatatp-secondary-foreground: ${foreground};
    --chatatp-muted: color-mix(in srgb, var(--chatatp-secondary) ${dark ? '22%' : '12%'}, ${surfaceAlt});
    --chatatp-muted-rgb: ${dark ? '30, 41, 59' : '241, 245, 249'};
    --chatatp-muted-foreground: ${mutedForeground};
    --chatatp-accent: color-mix(in srgb, var(--chatatp-secondary) ${dark ? '28%' : '12%'}, ${surfaceAlt});
    --chatatp-accent-foreground: ${foreground};
    --chatatp-destructive: #ef4444;
    --chatatp-destructive-foreground: #f8fafc;
    --chatatp-border: ${dark ? '#334155' : '#e2e8f0'};
    --chatatp-border-rgb: ${borderRgb};
    --chatatp-input: ${dark ? '#334155' : '#e2e8f0'};
    --chatatp-ring: ${primary};
    
  `;
}

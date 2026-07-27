export function getThemeVariables(themePrimary: string, themeSecondary: string) {
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

  // Hardcode shadcn default dark/light vars for isolation, mapped to chatatp-*
  return `
    --chatatp-primary: ${primary};
    --chatatp-primary-rgb: ${primaryRgb};
    --chatatp-secondary: ${secondary};
    --chatatp-secondary-rgb: ${secondaryRgb};
    
    --chatatp-background: color-mix(in srgb, var(--chatatp-secondary) 8%, #ffffff);
    --chatatp-foreground: #0f172a;
    --chatatp-card: color-mix(in srgb, var(--chatatp-secondary) 6%, #ffffff);
    --chatatp-card-rgb: 255, 255, 255;
    --chatatp-card-foreground: #0f172a;
    --chatatp-popover: #ffffff;
    --chatatp-popover-foreground: #0f172a;
    --chatatp-primary-foreground: #f8fafc;
    --chatatp-secondary-foreground: #0f172a;
    --chatatp-muted: color-mix(in srgb, var(--chatatp-secondary) 12%, #f8fafc);
    --chatatp-muted-rgb: 241, 245, 249;
    --chatatp-muted-foreground: #64748b;
    --chatatp-accent: #f1f5f9;
    --chatatp-accent-foreground: #0f172a;
    --chatatp-destructive: #ef4444;
    --chatatp-destructive-foreground: #f8fafc;
    --chatatp-border: #e2e8f0;
    --chatatp-border-rgb: 226, 232, 240;
    --chatatp-input: #e2e8f0;
    --chatatp-ring: ${primary};
    
    @media (prefers-color-scheme: dark) {
      --chatatp-background: #020817;
      --chatatp-foreground: #f8fafc;
      --chatatp-card: #020817;
      --chatatp-card-rgb: 2, 8, 23;
      --chatatp-card-foreground: #f8fafc;
      --chatatp-popover: #020817;
      --chatatp-popover-foreground: #f8fafc;
      --chatatp-primary-foreground: #020817;
      --chatatp-secondary-foreground: #f8fafc;
      --chatatp-muted: #1e293b;
      --chatatp-muted-rgb: 30, 41, 59;
      --chatatp-muted-foreground: #94a3b8;
      --chatatp-accent: #1e293b;
      --chatatp-accent-foreground: #f8fafc;
      --chatatp-destructive: #7f1d1d;
      --chatatp-destructive-foreground: #f8fafc;
      --chatatp-border: #1e293b;
      --chatatp-border-rgb: 30, 41, 59;
      --chatatp-input: #1e293b;
    }
  `;
}

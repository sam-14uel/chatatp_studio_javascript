export function getThemeVariables(themePrimary: string, themeSecondary: string) {
  // Very basic HEX to RGB converter for CSS var injection
  const hexToRgb = (hex: string) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return `${r}, ${g}, ${b}`;
  };

  const primaryRgb = hexToRgb(themePrimary || '#0ea5e9');
  const secondaryRgb = hexToRgb(themeSecondary || '#6366f1');

  // Hardcode shadcn default dark/light vars for isolation, mapped to chatatp-*
  return `
    --chatatp-primary: ${themePrimary};
    --chatatp-primary-rgb: ${primaryRgb};
    --chatatp-secondary: ${themeSecondary};
    --chatatp-secondary-rgb: ${secondaryRgb};
    
    --chatatp-background: #ffffff;
    --chatatp-foreground: #0f172a;
    --chatatp-card: #ffffff;
    --chatatp-card-rgb: 255, 255, 255;
    --chatatp-card-foreground: #0f172a;
    --chatatp-popover: #ffffff;
    --chatatp-popover-foreground: #0f172a;
    --chatatp-primary-foreground: #f8fafc;
    --chatatp-secondary-foreground: #0f172a;
    --chatatp-muted: #f1f5f9;
    --chatatp-muted-rgb: 241, 245, 249;
    --chatatp-muted-foreground: #64748b;
    --chatatp-accent: #f1f5f9;
    --chatatp-accent-foreground: #0f172a;
    --chatatp-destructive: #ef4444;
    --chatatp-destructive-foreground: #f8fafc;
    --chatatp-border: #e2e8f0;
    --chatatp-border-rgb: 226, 232, 240;
    --chatatp-input: #e2e8f0;
    --chatatp-ring: ${themePrimary};
    
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

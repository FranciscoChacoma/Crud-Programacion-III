export const theme = {
  color: {
    bg: '#0b140d',
    bgElevated: '#101d13',
    bgCard: '#0f1c11',
    bgInput: '#0a1610',
    border: '#1e3a24',
    borderStrong: '#2a4a30',
    text: '#f2f7f2',
    textMuted: '#8fa896',
    textFaint: '#5c7263',
    primary: '#4caf50',
    primaryStrong: '#5fd464',
    primaryDim: 'rgba(76, 175, 80, 0.14)',
    onPrimary: '#04140a',
    danger: '#f45b5b',
    dangerDim: 'rgba(244, 91, 91, 0.14)',
    warning: '#f5a623',
    warningDim: 'rgba(245, 166, 35, 0.14)',
    info: '#4aa8d8',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '18px',
    pill: '999px',
  },
  space: (n: number) => `${n * 4}px`,
  shadow: {
    card: '0 8px 24px rgba(0, 0, 0, 0.35)',
    pop: '0 12px 32px rgba(0, 0, 0, 0.45)',
  },
  font: {
    sans: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
  },
};

export const levelColor: Record<string, string> = {
  ALTO: theme.color.primary,
  MEDIO: theme.color.warning,
  BAJO: theme.color.danger,
};

export const categoryLabel: Record<string, string> = {
  A1: '1ra', A2: '2da', A3: '3ra', A4: '4ta',
  A5: '5ta', A6: '6ta', A7: '7ma', A8: '8va',
};

export const scheduleLabel: Record<string, string> = {
  H09_12: '09:00 - 12:00',
  H12_15: '12:00 - 15:00',
  H15_18: '15:00 - 18:00',
  H18_21: '18:00 - 21:00',
};

export const scheduleShortLabel: Record<string, string> = {
  H09_12: '09-12',
  H12_15: '12-15',
  H15_18: '15-18',
  H18_21: '18-21',
};

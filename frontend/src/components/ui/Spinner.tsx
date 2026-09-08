import { theme } from '../../theme';

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `2px solid ${theme.color.border}`,
        borderTopColor: theme.color.primary,
        borderRadius: '50%',
        animation: 'ui-spin 0.7s linear infinite',
      }}
    />
  );
}

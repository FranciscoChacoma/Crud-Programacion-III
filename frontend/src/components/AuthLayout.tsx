import type { ReactNode } from 'react';
import { Brand } from './Sidebar';
import { BrandMark, Icon, type IconName } from './ui';

const features: { icon: IconName; text: string }[] = [
  { icon: 'users', text: 'Inscripción de parejas con nivel y disponibilidad horaria' },
  { icon: 'layers', text: 'Armado automático de grupos por nivel' },
  { icon: 'calendar', text: 'Fixture con canchas y horarios asignados' },
];

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div className="auth">
      <aside className="auth-aside">
        <Brand />
        <div>
          <h2 className="auth-headline">Organizá torneos de pádel sin planillas.</h2>
          <p className="auth-lead">Desde la inscripción hasta el fixture final, todo en un solo lugar.</p>
          <div className="auth-features">
            {features.map(f => (
              <div key={f.text} className="auth-feature">
                <span className="auth-feature-icon"><Icon name={f.icon} size={16} /></span>
                {f.text}
              </div>
            ))}
          </div>
        </div>
        <p className="auth-copy">© {new Date().getFullYear()} PadelSync</p>
      </aside>
      <main className="auth-main">
        <div className="auth-panel">
          <BrandMark size={40} />
          <h1 className="auth-title">{title}</h1>
          <p className="auth-sub">{subtitle}</p>
          {children}
          <p className="auth-footer">{footer}</p>
        </div>
      </main>
    </div>
  );
}

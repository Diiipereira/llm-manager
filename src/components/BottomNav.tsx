import { SquaresFourIcon, CubeIcon, GearIcon } from '@phosphor-icons/react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: SquaresFourIcon, label: 'Dashboard' },
  { to: '/models', icon: CubeIcon, label: 'Models' },
  { to: '/settings', icon: GearIcon, label: 'Settings' },
];

export function BottomNav() {
  return (
    <div className="flex items-center justify-center py-3 shrink-0 bg-app">
      <nav className="bg-card/90 backdrop-blur-md border border-white/5 rounded-full flex items-center px-2 py-1.5 gap-2 shadow-2xl">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 ${isActive
                ? 'bg-accent text-on-accent'
                : 'text-text-muted hover:text-text-main'
              }`
            }
            title={label}
          >
            {({ isActive }) => <Icon size={20} weight={isActive ? 'fill' : 'regular'} />}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

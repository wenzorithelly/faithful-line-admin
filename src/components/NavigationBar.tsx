'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardListIcon,
  UserGroupIcon,
  CogIcon,
  ViewBoardsIcon
} from '@heroicons/react/outline';


export default function NavigationBar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/control',
      label: 'Controle',
      icon: ClipboardListIcon,
    },
    {
      href: '/presence',
      label: 'Presença',
      icon: UserGroupIcon,
    },
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: ViewBoardsIcon,
    },
    {
      href: '/settings',
      label: 'Configurações',
      icon: CogIcon,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 w-full ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-blue-500'
              }`}
              aria-label={item.label}
            >
              <Icon className="h-6 w-6 mb-1" aria-hidden="true" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
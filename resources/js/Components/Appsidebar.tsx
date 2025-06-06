import React, { useContext } from 'react';
import { SidebarContext } from '@/Components/ui/sidebar'; 
import { Link, usePage } from '@inertiajs/react';
import clsx from 'clsx';

export function AppSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('AppSidebar must be used inside SidebarProvider');

  const { isOpen } = context;
  const { url } = usePage();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Task', href: '/tasks' },
    { name: 'Projects', href: '/projects' },
    { name: 'Notifications', href: '/notifications' },
    { name: 'Roles', href: '/roles' },
    { name: 'Trash', href: '/trash' },
  ];

  if (!isOpen) return null;

  return (
    <aside className="w-64 h-screen p-4 shadow" style={{ backgroundColor: '#A1B6D9' }}>
      {/* Logo di atas */}
      <div className="mb-6 flex items-center justify-center">
        <img 
          src="/images/logonoted.png" 
          alt="Logo" 
          className="h-12 w-auto select-none" 
          draggable={false}
        />
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = url.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'block px-4 py-2 rounded transition-colors',
                isActive
                  ? 'bg-[#1B355E] font-semibold text-white'  // aktif: background gelap, teks putih
                  : 'text-[#1B355E] hover:bg-[#335DA2] hover:text-white'  // non aktif: teks #1B355E, hover bg & teks terang
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

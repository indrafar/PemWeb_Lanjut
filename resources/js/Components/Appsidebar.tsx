import React, { useContext } from 'react';
import { SidebarContext } from '@/Components/ui/sidebar'; 
import { Link, usePage } from '@inertiajs/react';
import clsx from 'clsx';

interface MyPageProps {
  auth: {
    user: {
      role: string;
    };
  };
}

type AppSidebarProps = {
  search?: string;
};

export function AppSidebar({ search }: AppSidebarProps) {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('AppSidebar must be used inside SidebarProvider');

  const { isOpen } = context;
  const { url } = usePage();
  const { auth } = usePage<any>().props; // <-- Ganti di sini

  const isAdmin = auth.user?.role === 'Admin';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Task', href: '/tasks' },
    { name: 'Projects', href: '/projects' },
    // Only show Manage Users for admin
    ...(isAdmin ? [{ name: 'Manage Users', href: '/manage-users' }] : []),
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

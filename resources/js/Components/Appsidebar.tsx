import React, { useContext } from 'react';
import { SidebarContext } from '@/Components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import {
  LucideLayoutDashboard,
  LucideListChecks,
  LucideFolder,
  LucideUsers,
  LucideTrash2,
  LucideChevronLeft,
  LucideChevronRight,
  LucideBell,
} from 'lucide-react';
import clsx from 'clsx';

interface PageProps {
  auth: {
    user: {
      role: string;
    };
  };
}

export function AppSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('AppSidebar must be used inside SidebarProvider');

  const { isOpen, toggle } = context;
  const { url, props } = usePage();
  const userRole = (props.auth?.user as any)?.role;
  const isAdmin = userRole === 'Admin';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LucideLayoutDashboard },
    { name: 'Task', href: '/tasks', icon: LucideListChecks },
    { name: 'Projects', href: '/projects', icon: LucideFolder },
    ...(isAdmin ? [{ name: 'Manage Users', href: '/manage-users', icon: LucideUsers }] : []),
    { name: 'Notifications', href: '/notifications', icon: LucideBell }, // ← tambahkan ini
    { name: 'Trash', href: '/trash', icon: LucideTrash2 },
  ];


  return (
    <aside
      className={clsx(
        'relative h-screen p-4 transition-all duration-300 shadow-md flex flex-col items-center',
        isOpen ? 'w-64' : 'w-20',
        'bg-[#1B355E] text-white'
      )}
    >
      {/* Toggle button fixed to the right side */}
    <button
      onClick={toggle}
      className="absolute -right-3 top-4 bg-white border rounded-full p-1 shadow hover:bg-gray-100 z-20"
    >
      {/* Tambahkan kelas text-blue-600 di sini */}
      {isOpen ? <LucideChevronLeft size={18} className="text-blue-600" /> : <LucideChevronRight size={18} className="text-blue-600" />}
    </button>


      {/* Logo and Text Side by Side */}
      <div className="mb-8 flex items-center justify-center gap-2">
        <img
          src="/images/logonoted.png"
          alt="Logo"
          className={clsx('select-none', isOpen ? 'h-12' : 'h-10')}
          draggable={false}
        />
        {isOpen && (
          <span
            className="text-3xl font-extrabold tracking-wide"
            style={{ fontFamily: 'Montserrat' }}
          >
            NOTED
          </span>
        )}
      </div>


      {/* Navigation */}
      <nav className="space-y-2 w-full flex-1">
        {navItems.map(({ name, href, icon: Icon }) => {
          const isActive = url.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-4 px-4 py-2 rounded-md transition-colors group relative',
                isActive
                  ? 'bg-white text-[#1B355E] font-semibold'
                  : 'hover:bg-white hover:text-[#1B355E] text-white'
              )}
            >
              <Icon size={20} />
              {isOpen ? (
                <span>{name}</span>
              ) : (
                <span className="sr-only group-hover:not-sr-only absolute left-full ml-2 whitespace-nowrap bg-white px-2 py-1 text-sm text-[#1B355E] rounded shadow-md z-10">
                  {name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

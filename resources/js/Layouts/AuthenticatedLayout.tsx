import { PropsWithChildren, ReactNode } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { SidebarProvider, SidebarTrigger } from '@/Components/ui/sidebar';
import { AppSidebar } from '@/Components/Appsidebar';
import { ChevronDown, User } from 'lucide-react';
import { Toaster } from '@/Components/ui/toaster';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/Components/ui/dropdown-menu';

export default function Authenticated({
  header,
  children,
}: PropsWithChildren<{ header?: ReactNode }>) {
  const user = usePage().props.auth.user;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />

        <div className="flex flex-col flex-1 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">

              {header && <div className="text-xl font-semibold text-gray-800">{header}</div>}
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  className="hidden md:flex items-center gap-2 cursor-pointer px-2"
                >
                  <div className="flex items-center gap-2">
                    <User />
                    <span>{user.name}</span>
                    <ChevronDown />
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start">
                  <DropdownMenuItem>
                    <Link href={route('profile.edit')} className="w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href={route('logout')} method="post" as="button" className="w-full text-start">
                      Log Out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <User className="cursor-pointer" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem>
                      <Link href={route('profile.edit')} className="w-full">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={route('logout')} method="post" as="button" className="w-full text-start">
                        Log Out
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {children}
          <Toaster />
        </div>
      </div>
    </SidebarProvider>
  );
}

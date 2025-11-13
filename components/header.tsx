import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { UserNav } from '@/components/user-nav';
import { Search } from 'lucide-react';
import type { ReactNode } from 'react';

type HeaderProps = {
  title: string;
  children?: ReactNode;
};

export function Header({ title, children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <SidebarTrigger className="md:hidden" />

      <h1 className="text-lg font-semibold md:text-xl whitespace-nowrap">{title}</h1>

      <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-card pl-8 md:w-[200px] lg:w-[320px]"
          />
        </div>
        {children}
        <UserNav />
      </div>
    </header>
  );
}

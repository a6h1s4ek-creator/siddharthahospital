
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { Icons } from '@/components/icons';
import { UserNav } from '@/components/user-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { user } from '@/lib/data';
import Link from 'next/link';
import { AppearanceProvider } from '@/components/appearance-provider';
import { FirebaseClientProvider } from '@/firebase';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <AppearanceProvider>
        <SidebarProvider>
          <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader>
              <Link href="/dashboard" className="flex items-center gap-2">
                <Icons.Logo className="w-7 h-7 text-primary" />
                <span className="text-lg font-semibold text-sidebar-foreground">
                  Siddhartha
                </span>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <MainNav />
            </SidebarContent>
          </Sidebar>
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </AppearanceProvider>
    </FirebaseClientProvider>
  );
}

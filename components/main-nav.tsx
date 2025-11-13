
'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  UsersRound,
  BarChart,
  Settings,
  HelpCircle,
  LogOut,
  Wallet,
  BedDouble,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function MainNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div className="flex flex-col h-full">
      <SidebarMenu className="flex-1">
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive('/dashboard')}
            tooltip={{ children: 'Dashboard' }}
          >
            <Link href="/dashboard">
              <LayoutDashboard />
              Dashboard
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive('/patients')}
            tooltip={{ children: 'Patients' }}
          >
            <Link href="/patients">
              <Users />
              Patients
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive('/admissions')}
            tooltip={{ children: 'Admissions' }}
          >
            <Link href="/admissions">
              <BedDouble />
              Admissions
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive('/appointments')}
            tooltip={{ children: 'Appointments' }}
          >
            <Link href="/appointments">
              <Calendar />
              Appointments
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive('/billing')}
            tooltip={{ children: 'Billing' }}
          >
            <Link href="/billing">
              <CreditCard />
              Billing
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <div className="mt-auto">
        <SidebarGroup>
          <SidebarGroupLabel>More</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/staff')}
                  tooltip={{ children: 'Staff' }}
                >
                  <Link href="/staff">
                    <UsersRound />
                    Staff
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/salary')}
                  tooltip={{ children: 'Salary' }}
                >
                  <Link href="/salary">
                    <Wallet />
                    Salary
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/reports')}
                  tooltip={{ children: 'Reports' }}
                >
                  <Link href="/reports">
                    <BarChart />
                    Reports
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/settings')}
                  tooltip={{ children: 'Settings' }}
                >
                  <Link href="/settings">
                    <Settings />
                    Settings
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarMenu className="border-t border-sidebar-border p-2">
           <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{ children: 'Logout' }}>
              <Link href="/login">
                <LogOut />
                Logout
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </div>
  );
}

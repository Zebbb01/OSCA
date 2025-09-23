'use client';

import * as React from 'react';
import { LayoutDashboard } from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenuButton,
    SidebarRail,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import Image from 'next/image';
import {
    faDesktop,
    faFile,
    faGear,
    faMoneyBillWave,
    faPersonCane,
    IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { useSession } from 'next-auth/react';
import { NavUser } from '@/components/nav-user';

interface NavSubItem {
    title: string;
    url: string;
    roles?: string[];
}

interface NavMainItem {
    title: string;
    icon?: IconDefinition;
    roles?: string[];
    items: NavSubItem[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session, status } = useSession();
    const userRole = (session?.user as any)?.role || 'USER';

    const baseNavData: { navMain: NavMainItem[] } = {
        navMain: [
            {
                title: 'Senior Citizen',
                roles: ['ADMIN', 'USER'],
                items: [
                    {
                        title: 'Record',
                        url: '/admin/senior-citizen/record',
                        roles: ['ADMIN', 'USER'],
                    },
                ],
            },
            {
                title: 'Applications',
                roles: ['ADMIN', 'USER'],
                items: [
                    {
                        title: 'Benefits',
                        url: '/staff/applications/benefits',
                        roles: ['USER'],
                    },
                    {
                        title: 'Applicants',
                        url: '/admin/applications/overview',
                        roles: ['ADMIN'],
                    },
                ],
            },
            {
                title: 'Monitoring',
                roles: ['ADMIN', 'USER'],
                items: [
                    {
                        title: 'Overview',
                        url: '/admin/applications/overview',
                        roles: ['ADMIN'],
                    },
                    {
                        title: 'Released',
                        url: '/admin/applications/released-monitoring',
                        roles: ['ADMIN'],
                    },
                    {
                        title: 'Pending',
                        url: '/admin/applications/pending-monitoring',
                        roles: ['ADMIN'],
                    },
                    {
                        title: 'Category',
                        url: '/admin/applications/category',
                        roles: ['ADMIN'],
                    },
                    {
                        title: 'Overview',
                        url: '/staff/applications/overview',
                        roles: ['USER'],
                    },
                    {
                        title: 'Released',
                        url: '/staff/applications/released-monitoring',
                        roles: ['USER'],
                    },
                    {
                        title: 'Pending',
                        url: '/staff/applications/pending-monitoring',
                        roles: ['USER'],
                    },
                    {
                        title: 'Category',
                        url: '/staff/applications/category',
                        roles: ['USER'],
                    },
                ],
            },
            {
                title: 'Financial',
                roles: ['ADMIN'],
                items: [
                    {
                        title: 'Government Fund',
                        url: '/admin/applications/government-fund',
                    },
                    {
                        title: 'Monthly Release',
                        url: '/admin/applications/monthly-release',
                    },
                ],
            },
            {
                title: 'Settings',
                roles: ['ADMIN'],
                items: [
                    {
                        title: 'Archive',
                        url: '/admin/settings/archive',
                    },
                ],
            },
        ],
    };

    const processedNavData = {
        navMain: baseNavData.navMain.map((navItem) => {
            if (navItem.title === 'Senior Citizen') {
                return {
                    ...navItem,
                    items: navItem.items.map((subItem) => {
                        if (subItem.title === 'Record') {
                            return {
                                ...subItem,
                                url:
                                    userRole === 'USER'
                                        ? '/staff/senior-citizen/record'
                                        : '/admin/senior-citizen/record',
                            };
                        }
                        return subItem;
                    }),
                };
            }
            return navItem;
        }),
    };

    const filteredNav = processedNavData.navMain
        .map((navItem) => {
            if (navItem.roles && !navItem.roles.includes(userRole)) {
                return null;
            }

            const filteredItems = navItem.items.filter((item) => {
                if (item.roles) {
                    return item.roles.includes(userRole);
                }
                return true;
            });

            if (navItem.items && filteredItems.length === 0 && navItem.items.length > 0) {
                return null;
            }

            return {
                ...navItem,
                items: filteredItems,
            };
        })
        .filter(Boolean) as NavMainItem[];

    const dashboardLink =
        userRole === 'ADMIN' ? (
            <SidebarMenuButton>
                <LayoutDashboard />
                <a href={'/admin/dashboard'}>
                    <span>Dashboard</span>
                </a>
            </SidebarMenuButton>
        ) : (
            <SidebarMenuButton>
                <LayoutDashboard />
                <a href={'/staff/dashboard'}>
                    <span>Dashboard</span>
                </a>
            </SidebarMenuButton>
        );

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <div className="flex items-center gap-2">
                        <Image
                            src={'/img/cthall-logo.jpg'}
                            width={30}
                            height={30}
                            alt="OSCA Logo"
                            className="rounded-full"
                        />
                        <div className="flex flex-col">
                            <span className="truncate font-medium">OSCA</span>
                            <span className="truncate text-xs">Government</span>
                        </div>
                    </div>
                </SidebarMenuButton>
            </SidebarHeader>

            <SidebarContent>
                {dashboardLink}

                {filteredNav.map((item) => (
                    <SidebarGroup key={item.title}>
                        <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {item.items.map((subItem) => (
                                    <SidebarMenuItem key={subItem.title}>
                                        <SidebarMenuButton asChild>
                                            <a href={subItem.url} className="pl-6">
                                                {subItem.title}
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                {status === 'loading' ? (
                    <div className="p-4 text-sm text-gray-500">Loading user...</div>
                ) : session?.user ? (
                    <NavUser
                        user={{
                            username: session.user.username ?? '',
                            email: session.user.email ?? '',
                            role: (session.user as any).role ?? 'USER',
                        }}
                    />
                ) : (
                    <div className="p-4 text-sm text-gray-500">No user session found.</div>
                )}
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
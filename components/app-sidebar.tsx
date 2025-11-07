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
import { useSession } from 'next-auth/react';
import { NavUser } from '@/components/nav-user';

interface NavSubItem {
    title: string;
    url: string;
    roles?: string[];
}

interface NavMainItem {
    title: string;
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
                        url: '/admin/record',
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
                        url: '/staff/benefits',
                        roles: ['USER'],
                    },
                    {
                        title: 'Applicants',
                        url: '/admin/overview',
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
                        url: '/admin/overview',
                        roles: ['ADMIN'],
                    },
                    {
                        title: 'Released',
                        url: '/admin/released-monitoring',
                        roles: ['ADMIN'],
                    },
                    {
                        title: 'Pending',
                        url: '/admin/pending-monitoring',
                        roles: ['ADMIN'],
                    },
                    {
                        title: 'Category',
                        url: '/admin/category',
                        roles: ['ADMIN'],
                    },
                    {
                        title: 'Overview',
                        url: '/staff/overview',
                        roles: ['USER'],
                    },
                    {
                        title: 'Released',
                        url: '/staff/released-monitoring',
                        roles: ['USER'],
                    },
                    {
                        title: 'Pending',
                        url: '/staff/pending-monitoring',
                        roles: ['USER'],
                    },
                    {
                        title: 'Category',
                        url: '/staff/category',
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
                        url: '/admin/government-fund',
                    },
                    {
                        title: 'Monthly Release',
                        url: '/admin/monthly-release',
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
                                        ? '/staff/record'
                                        : '/admin/record',
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

    return (
        <Sidebar collapsible="icon" className="border-r border-gray-200" {...props}>
            <SidebarHeader className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-green-100 data-[state=open]:text-green-800 hover:bg-green-100 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Image
                                src={'/img/cthall-logo.jpg'}
                                width={32}
                                height={32}
                                alt="OSCA Logo"
                                className="rounded-full ring-2 ring-green-200"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="truncate font-bold text-green-800">OSCA</span>
                            <span className="truncate text-xs text-green-600">Government</span>
                        </div>
                    </div>
                </SidebarMenuButton>
            </SidebarHeader>

            <SidebarContent className="bg-white">
                <SidebarGroup className="px-2 py-2">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            {userRole === 'ADMIN' ? (
                                <SidebarMenuButton asChild className="hover:bg-green-50 hover:text-green-700 transition-colors">
                                    <a href={'/admin/dashboard'} className="flex items-center gap-3">
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span className="font-medium">Dashboard</span>
                                    </a>
                                </SidebarMenuButton>
                            ) : (
                                <SidebarMenuButton asChild className="hover:bg-green-50 hover:text-green-700 transition-colors">
                                    <a href={'/staff/dashboard'} className="flex items-center gap-3">
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span className="font-medium">Dashboard</span>
                                    </a>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                {filteredNav.map((item) => (
                    <SidebarGroup key={item.title} className="px-2 py-1">
                        <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
                            {item.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {item.items.map((subItem) => (
                                    <SidebarMenuItem key={subItem.title}>
                                        <SidebarMenuButton asChild className="hover:bg-green-50 hover:text-green-700 transition-colors">
                                            <a href={subItem.url} className="pl-6 py-2 text-sm font-medium">
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

            <SidebarFooter className="border-t border-gray-200 bg-gray-50">
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

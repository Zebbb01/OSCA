'use client'

import * as React from 'react'
import { LayoutDashboard } from 'lucide-react'

import { CollapsibleNavLinks } from '@/components/collapsible-navlink'
import { NavUser } from '@/components/nav-user'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenuButton,
    SidebarRail,
} from '@/components/ui/sidebar'

import Image from 'next/image'
import {
    faDesktop,
    faFile,
    faGear,
    faMoneyBillWave,
    faPersonCane,
    IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { useSession } from 'next-auth/react'

// --- Define your types here ---

interface NavSubItem {
    title: string
    url: string
    roles?: string[]
}

interface CollapsibleNavItem {
    title: string
    icon: IconDefinition
    isActive?: boolean
    url: string
    items: NavSubItem[]
    roles?: string[]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session, status } = useSession()
    const userRole = (session?.user as any)?.role || 'USER'

    // Define base navigation data
    const baseNavData: { collapsNav: CollapsibleNavItem[] } = {
        collapsNav: [
            {
                title: 'Senior Citizen',
                icon: faPersonCane,
                isActive: true,
                url: '#',
                roles: ['ADMIN', 'USER'], // Both ADMIN and USER can see this parent item
                items: [
                    {
                        title: 'Record',
                        url: '/admin/senior-citizen/record', // This will be dynamically changed
                        roles: ['ADMIN', 'USER'], // Both can access, but URL changes for USER
                    },
                ],
            },
            {
                title: 'Applications',
                url: '#',
                icon: faFile,
                roles: ['ADMIN', 'USER'],
                items: [
                    {
                        title: 'Benefits',
                        url: '/staff/applications/benefits',
                        roles: ['USER'],
                    },
                    {
                        title: 'Applicants',
                        url: '/admin/applications/applicants',
                        roles: ['ADMIN'],
                    },
                ],
            },
            {
                title: 'Monitoring',
                url: '#',
                icon: faDesktop,
                roles: ['ADMIN', 'USER'],
                items: [
                    // ADMIN
                    {
                        title: 'Overview',
                        url: '/admin/applications/overview',
                        roles: ['ADMIN']
                    },
                    {
                        title: 'Released',
                        url: '/admin/applications/released-monitoring',
                        roles: ['ADMIN']
                    },
                    {
                        title: 'Unreleased',
                        url: '/admin/applications/unreleased-monitoring',
                        roles: ['ADMIN']
                    },
                    {
                        title: 'Category',
                        url: '/admin/applications/category',
                        roles: ['ADMIN']
                    },
                    // STAFF
                    {
                        title: 'Overview',
                        url: '/staff/applications/overview',
                        roles: ['USER']
                    },
                    {
                        title: 'Release',
                        url: '/staff/applications/released-monitoring',
                        roles: ['USER']
                    },
                    {
                        title: 'Not Release',
                        url: '/staff/applications/unreleased-monitoring',
                        roles: ['USER']
                    },
                    {
                        title: 'Category',
                        url: '/staff/applications/category',
                        roles: ['USER']
                    },
                ],
            },
            {
                title: 'Financial',
                url: '#',
                icon: faMoneyBillWave,
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
                url: '#',
                icon: faGear,
                roles: ['ADMIN'],
                items: [
                    {
                        title: 'Archive',
                        url: '/admin/settings/archive',
                    },
                ],
            },
        ],
    }

    // Adjust the URL for 'Senior Citizen Record' based on user role
    const processedNavData = {
        collapsNav: baseNavData.collapsNav.map(navItem => {
            if (navItem.title === 'Senior Citizen') {
                return {
                    ...navItem,
                    items: navItem.items.map(subItem => {
                        if (subItem.title === 'Record') {
                            return {
                                ...subItem,
                                url: userRole === 'USER' ? '/staff/senior-citizen/record' : '/admin/senior-citizen/record'
                            };
                        }
                        return subItem;
                    })
                };
            }
            return navItem;
        })
    };


    const dashboardLink = (
        <SidebarMenuButton>
            <LayoutDashboard />
            <a href={'/admin/dashboard'}>
                <span>Dashboard</span>
            </a>
        </SidebarMenuButton>
    )

    const filteredNav = processedNavData.collapsNav
        .map((navItem) => {
            if (navItem.roles && !navItem.roles.includes(userRole)) {
                return null
            }

            const filteredItems = navItem.items.filter((item) => {
                if (item.roles) {
                    return item.roles.includes(userRole)
                }
                return true
            })

            if (navItem.items && filteredItems.length === 0 && navItem.items.length > 0) {
                return null
            }

            return {
                ...navItem,
                items: filteredItems,
            }
        })
        .filter(Boolean) as CollapsibleNavItem[]

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
                {userRole === 'ADMIN' && dashboardLink}

                <CollapsibleNavLinks items={filteredNav} />
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
    )
}
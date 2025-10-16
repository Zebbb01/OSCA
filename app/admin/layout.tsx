'use client'

import { AppSidebar } from '@/components/app-sidebar'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

import { usePathname } from 'next/navigation'
import { formatSegment } from '@/utils/segment'
import { NotificationDropdown } from '@/components/notification-dropdown'
import { useSession } from 'next-auth/react'


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const pathSegments = (pathname ?? '').split('/').filter(Boolean)
    const { data: session, status: sessionStatus } = useSession();
    const userRole = (session?.user as any)?.role || 'USER';

    return (
        <SidebarProvider
            style={
                {
                    '--sidebar-width': '12rem', // overide the default width
                } as React.CSSProperties
            }>
            {/* SIDEBAR */}
            <AppSidebar />

            <SidebarInset>
                <header className="bg-green-600 text-white w-full flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 shadow-md">
                    <div className="flex items-center justify-between w-full px-4">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <SidebarTrigger className="-ml-1 text-white hover:bg-white/20 transition-colors" />

                            <Separator
                                orientation="vertical"
                                className="mr-2 h-4 bg-white/30"
                            />

                            <div className="min-w-0 flex-1 group-has-data-[collapsible=icon]/sidebar-wrapper:hidden">
                                <Breadcrumb>
                                    <BreadcrumbList className="flex flex-wrap items-center gap-1">
                                        {pathSegments.map((segment, index) => {
                                            const href = '/' + pathSegments.slice(0, index + 1).join('/')
                                            const isLast = index === pathSegments.length - 1

                                            return (
                                                <div
                                                    key={href}
                                                    className="flex items-center gap-1 text-white"
                                                >
                                                    <BreadcrumbItem>
                                                        {isLast ? (
                                                            <BreadcrumbPage className="text-white font-medium">
                                                                {formatSegment(segment)}
                                                            </BreadcrumbPage>
                                                        ) : (
                                                            <BreadcrumbLink
                                                                href={href}
                                                                className="text-white/90 hover:text-white transition-colors"
                                                            >
                                                                {formatSegment(segment)}
                                                            </BreadcrumbLink>
                                                        )}
                                                    </BreadcrumbItem>

                                                    {!isLast && <BreadcrumbSeparator className="text-white/60" />}
                                                </div>
                                            )
                                        })}
                                    </BreadcrumbList>
                                </Breadcrumb>
                            </div>
                        </div>

                        <div className="flex-shrink-0">
                            <NotificationDropdown userRole={userRole} />
                        </div>
                    </div>
                </header>

                {/* MAIN PANEL CONTENTS */}
                <div className="flex flex-1 flex-col gap-2 p-4 pt-0 ">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    )
}

// components/providers/NavigationLoadingProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface NavigationLoadingContextType {
    isLoading: boolean
    startLoading: () => void
    stopLoading: () => void
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType>({
    isLoading: false,
    startLoading: () => {},
    stopLoading: () => {},
})

export const useNavigationLoading = () => useContext(NavigationLoadingContext)

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false)
    const pathname = usePathname()

    // Stop loading when pathname changes
    useEffect(() => {
        setIsLoading(false)
    }, [pathname])

    const startLoading = () => setIsLoading(true)
    const stopLoading = () => setIsLoading(false)

    return (
        <NavigationLoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
            {isLoading && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-black/60 via-black/50 to-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in">
                    <div className="relative">
                        {/* Animated Background Circles */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-32 w-32 rounded-full bg-green-500/20 animate-ping" style={{ animationDuration: '2s' }}></div>
                            <div className="absolute h-24 w-24 rounded-full bg-green-400/30 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.3s' }}></div>
                        </div>

                        {/* Main Card */}
                        <div className="relative flex flex-col items-center gap-6 rounded-2xl bg-white/95 backdrop-blur-xl p-10 shadow-2xl border border-white/20 animate-in zoom-in duration-300">
                            {/* Modern Spinner */}
                            <div className="relative">
                                {/* Outer Ring */}
                                <div className="h-20 w-20 rounded-full border-4 border-gray-200/50"></div>
                                
                                {/* Spinning Ring */}
                                <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-transparent border-t-green-500 border-r-green-400 animate-spin"></div>
                                
                                {/* Inner Pulse */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 animate-pulse"></div>
                                </div>

                                {/* Center Dot */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-3 w-3 rounded-full bg-white shadow-lg"></div>
                                </div>
                            </div>

                            {/* Loading Text with Animation */}
                            <div className="flex flex-col items-center gap-2">
                                <h3 className="text-xl font-bold text-gray-800 animate-pulse">
                                    Loading
                                    <span className="inline-flex ml-1">
                                        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                                        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                                        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                                    </span>
                                </h3>
                                <p className="text-sm text-gray-500">Please wait a moment</p>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-full animate-progress"></div>
                            </div>
                        </div>

                        {/* Floating Particles */}
                        <div className="absolute -top-4 -left-4 h-3 w-3 rounded-full bg-green-400 animate-float" style={{ animationDelay: '0s' }}></div>
                        <div className="absolute -top-2 -right-6 h-2 w-2 rounded-full bg-green-500 animate-float" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute -bottom-4 -right-2 h-3 w-3 rounded-full bg-green-300 animate-float" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute -bottom-2 -left-6 h-2 w-2 rounded-full bg-green-400 animate-float" style={{ animationDelay: '1.5s' }}></div>
                    </div>
                </div>
            )}
            {children}
        </NavigationLoadingContext.Provider>
    )
}

// Custom hook for navigation with loading
export function useNavigationWithLoading() {
    const router = useRouter()
    const { startLoading } = useNavigationLoading()

    const push = (href: string) => {
        startLoading()
        router.push(href)
    }

    const replace = (href: string) => {
        startLoading()
        router.replace(href)
    }

    return { push, replace }
}
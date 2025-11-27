// app/page.tsx
'use client'

import Image from 'next/image'
import LoginForm from '@/components/auth/LoginForm'
import SignUpForm from '@/components/auth/SignUpForm'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
    const [role, setRole] = useState<'admin' | 'staff' | null>(null)
    const [showSignUp, setShowSignUp] = useState(false)

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-900 font-[family-name:var(--font-geist-sans)]">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                <Image
                    src="/img/cthall-bg.png"
                    alt="City Hall Background"
                    layout="fill"
                    objectFit="cover"
                    quality={100}
                    className="z-0"
                    priority
                />
                <div className="absolute inset-0 z-10 bg-black opacity-50"></div>
            </div>

            <div className="relative z-20 mx-auto grid w-full max-w-screen-xl gap-16 px-4 py-8 lg:grid-cols-2 lg:gap-32 lg:py-20">
                {/* Left Section - Branding and Tagline */}
                <div className="flex flex-col items-center justify-center gap-6 text-center lg:items-start lg:text-left">
                    <div className="flex items-center gap-4">
                        <Image
                            className="rounded-full shadow-lg"
                            src="/img/cthall-logo.jpg"
                            alt="OSCA Logo"
                            width={100}
                            height={100}
                            priority
                        />
                        <div className="flex flex-col">
                            <h1 className="mb-1 text-5xl font-extrabold tracking-tight leading-none text-white md:text-6xl lg:text-7xl">
                                OSCA
                            </h1>
                            <p className="text-lg font-semibold text-gray-300 md:text-xl">
                                OFFICE OF THE SENIOR CITIZEN AFFAIRS
                            </p>
                        </div>
                    </div>
                    <p className="text-xl text-gray-200 md:text-2xl lg:max-w-xl">
                        Connecting seniors with lifelong learning and community support. Promoting active aging and protection of senior rights.
                    </p>
                </div>

                {/* Right Section - Forms */}
                <div className="flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {!role && (
                            <motion.div
                                key="role-selector"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full max-w-md rounded-lg bg-white/90 p-8 shadow-2xl backdrop-blur-sm"
                            >
                                <div className="flex flex-col gap-6">
                                    <button
                                        onClick={() => setRole('admin')}
                                        className="w-full transform rounded-lg bg-indigo-600 px-6 py-3 text-lg font-bold text-white shadow-md transition duration-300 ease-in-out hover:scale-[1.02] hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                                    >
                                        Admin
                                    </button>
                                    <button
                                        onClick={() => setRole('staff')}
                                        className="w-full transform rounded-lg bg-emerald-600 px-6 py-3 text-lg font-bold text-white shadow-md transition duration-300 ease-in-out hover:scale-[1.02] hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
                                    >
                                        Staff
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {role && (
                            <motion.div
                                key="auth-forms"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full max-w-md rounded-lg bg-white/90 p-8 shadow-2xl backdrop-blur-sm"
                            >
                                <AnimatePresence mode="wait">
                                    {showSignUp ? (
                                        <motion.div
                                            key="signup"
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <SignUpForm onBackToLogin={() => setShowSignUp(false)} />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="login"
                                            initial={{ opacity: 0, x: -50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 50 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <LoginForm
                                                onGoToSignUp={role === 'staff' ? () => setShowSignUp(true) : undefined}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Back button for forms */}
                                <div className="mt-6 text-center">
                                    <button
                                        onClick={() => {
                                            setRole(null)
                                            setShowSignUp(false)
                                        }}
                                        className="border-2 rounded-sm border-emerald-600 bg-emerald-600 hover:bg-emerald-700 px-3 text-lg font-medium text-white hover:text-white transition duration-200"
                                    >
                                        ←
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
'use client'

import { LoginFormData, loginSchema } from '@/schema/auth/login.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react' // Import useSession
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthErrors } from '@/hooks/useAuthErrors'
import PrimaryButton from '../ui/primary-button'

interface LoginFormProps {
    onGoToSignUp?: () => void
}

const LoginForm = ({ onGoToSignUp }: LoginFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const { getErrorMessage } = useAuthErrors()
    const { data: session } = useSession(); // Get session data

    const onLogin = async (data: LoginFormData) => {
        setIsLoggingIn(true)
        clearErrors('root.serverError')

        try {
            const result = await signIn('credentials', {
                redirect: false, // Important: Keep redirect: false to handle redirection manually
                username: data.username,
                password: data.password,
            })

            if (result?.error) {
                const errorMessage = getErrorMessage(result.error)
                setError('root.serverError', { type: 'manual', message: errorMessage })
                toast.error(errorMessage)
                return
            }
            toast.success('Login successful! Redirecting...')
            router.push('/admin'); // This will then be handled by app/admin/page.tsx or app/staff/page.tsx based on role

        } catch (error) {
            const errorMessage = getErrorMessage('UNEXPECTED_ERROR')
            setError('root.serverError', { type: 'manual', message: errorMessage })
            toast.error(errorMessage)
        } finally {
            setIsLoggingIn(false)
        }
    }

    return (
        <div className="w-full">
            <div className="mb-8 text-center">
                <h2 className="text-4xl font-bold text-gray-800">Welcome Back!</h2>
                <p className="text-gray-600 mt-2">Sign in to your OSCA account.</p>
            </div>

            <form onSubmit={handleSubmit(onLogin)} className="space-y-6">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username
                    </label>
                    <div className="mt-1">
                        <input
                            {...register('username')}
                            id="username"
                            placeholder="Enter your username"
                            className={cn(
                                'block w-full rounded-md border border-gray-300 px-4 py-2 text-base text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500',
                                errors.username && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            )}
                            autoComplete="username"
                        />
                        {errors.username && (
                            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                        )}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="text-sm">
                            <a
                                href="#"
                                className="font-medium text-emerald-600 hover:text-emerald-500 transition duration-200"
                            >
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <div className="mt-1">
                        <div className="relative">
                            <input
                                {...register('password')}
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                className={cn(
                                    'block w-full rounded-md border border-gray-300 px-4 py-2 text-base text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500',
                                    errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                        {errors.root?.serverError && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.root.serverError.message}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <PrimaryButton
                        type="submit"
                        className={cn(
                            'flex w-full items-center justify-center rounded-md px-4 py-2.5 text-lg font-semibold text-white shadow-md transition duration-300 ease-in-out',
                            isLoggingIn
                                ? 'cursor-not-allowed bg-gray-400'
                                : 'bg-emerald-600 hover:bg-emerald-700'
                        )}
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Logging In...
                            </>
                        ) : (
                            'Login'
                        )}
                    </PrimaryButton>
                </div>
            </form>

            {onGoToSignUp && (
                <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={onGoToSignUp}
                        className="font-semibold text-emerald-600 hover:text-emerald-500 transition duration-200 cursor-pointer underline"
                    >
                        Sign up here
                    </button>
                </p>
            )}
        </div>
    )
}

export default LoginForm
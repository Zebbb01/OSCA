'use client'

import { SignUpFormData, signupSchema } from '@/schema/auth/signup.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// Shadcn UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Import react-datepicker and its CSS
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format } from 'date-fns'

interface SignUpFormProps {
  onBackToLogin: () => void
}

const SignUpForm = ({ onBackToLogin }: SignUpFormProps) => {
  const form = useForm<SignUpFormData>({ // Keep the 'form' object
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      contactNo: '',
      username: '',
      bday: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Destructure properties from 'form' after it's defined
  const { control, handleSubmit, formState: { errors }, setError, clearErrors } = form;


  const router = useRouter()

  const [isSigningUp, setIsSigningUp] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const onSignUp = async (data: SignUpFormData) => {
    setIsSigningUp(true)
    clearErrors('root.serverError')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      // Check if response has content before parsing JSON
      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        result = { message: 'Invalid response from server' };
      }

      if (!response.ok) {
        setError('root.serverError', {
          type: 'manual',
          message: result.message || 'An error occurred during signup. Please try again.',
        })
        toast.error(result.message || 'Signup failed.')
        return
      }

      toast.success('Sign up successful! Please check your email to verify your account.')
      onBackToLogin()
    } catch (error) {
      console.error('Signup error:', error)
      setError('root.serverError', {
        type: 'manual',
        message: 'An unexpected error occurred. Please try again.',
      })
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsSigningUp(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-gray-800">Create Your Account</h2>
        <p className="mt-2 text-gray-600">Join OSCA today and connect with the community.</p>
      </div>

      <Form {...form}> {/* This line now correctly uses the 'form' object */}
        <form onSubmit={handleSubmit(onSignUp)} className="space-y-6">
          <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
            {/* First Name */}
            <FormField
              control={control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Middle Name (Optional) */}
            <FormField
              control={control}
              name="middleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your middle name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact No. */}
            <FormField
              control={control}
              name="contactNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 09123456789" type="tel" maxLength={11} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Username */}
            <FormField
              control={control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Create a username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Birthday - Custom structure with Controller */}
            <div>
              <label htmlFor="bday" className="block text-sm font-medium text-gray-700">
                Birthday
              </label>
              <div className="mt-1">
                <Controller
                  name="bday"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value ? new Date(field.value) : null}
                      onChange={(date: Date | null) => {
                        field.onChange(date ? format(date, 'MM/dd/yyyy') : '');
                      }}
                      dateFormat={[
                        'MM/dd/yyyy',
                        'yyyy-MM-dd',
                        'MMMM d, yyyy',
                        'MMM d, yyyy',
                        'MMMM dd, yyyy',
                        'MMMM dd yyyy',
                        'MM/dd/yyyy',
                      ]}
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      placeholderText="MM/DD/YYYY"
                      className={cn(
                        "block w-full rounded-md border border-gray-300 px-4 py-2 text-base text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500",
                        errors.bday && "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                    />
                  )}
                />
                {errors.bday && (
                  <p className="mt-1 text-sm text-red-600">{errors.bday.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email address" type="email" {...field} autoComplete="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={control}
              name="password"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Create a password"
                        type={showPassword ? 'text' : 'password'}
                        {...field}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Confirm your password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...field}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {errors.root?.serverError && (
            <div className="mt-4 text-center text-sm text-red-600">
              {errors.root.serverError.message}
            </div>
          )}

          <div className="mt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing Up...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </div>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Button
          type="button"
          variant="link"
          onClick={onBackToLogin}
          className="p-0 text-emerald-600 hover:text-emerald-500 hover:no-underline"
        >
          Log in here
        </Button>
      </p>
    </div>
  )
}

export default SignUpForm
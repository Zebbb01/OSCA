/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosResponse } from 'axios'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: 'application/json',
    },
})

interface ApiError {
    message: string
    statusCode?: number
}

async function handleRequest<T>(promise: Promise<AxiosResponse<T>>): Promise<T> {
    try {
        const response = await promise
        return response.data
    } catch (error: any) {
        let apiError: ApiError

        if (axios.isAxiosError(error)) {
            const status = error.response?.status

            apiError = {
                message:
                    error.response?.data?.message ||
                    error.message ||
                    'An unexpected error occurred.',
                statusCode: status,
            }

            // IF AUTHENTICATED ERROR HAPPENS POP UP A MODAL SAYS YOU ARE LOGGED OUT DUE TO INACTIVITY
            
            if (status === 401 || status === 404) {
                console.warn('Redirecting due to auth/404 error')
                window.location.href = '/'
            }

            // You might want to log the full error object in a non-production environment
            console.error('API Error (Axios):', error)

        } else if (error instanceof Error) {
            apiError = {
                message: error.message || 'An unexpected error occurred.',
            }

            console.error('API Error (General):', error)
        } else {
            apiError = {
                message: 'An unknown error occurred.',
            }

            console.error('API Error (Unknown):', error)
        }

        throw apiError
    }
}

const get = <T>(url: string, config?: object): Promise<T> => handleRequest(api.get<T>(url, config))

const post = <T>(url: string, data?: any, config?: object): Promise<T> =>
    handleRequest(api.post<T>(url, data, config))

const put = <T>(url: string, data?: any, config?: object): Promise<T> =>
    handleRequest(api.put<T>(url, data, config))

const del = <T>(url: string, config?: object): Promise<T> =>
    handleRequest(api.delete<T>(url, config))

export const apiService = {
    get,
    post,
    put,
    delete: del,
}

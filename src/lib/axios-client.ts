/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { useAuthStore } from '@/stores/auth-store'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4005'

// Create the main axios instance
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 150000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Flag to prevent multiple refresh token requests
let isRefreshing = false
let failedQueue: Array<{
    resolve: (token: string) => void
    reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token!)
        }
    })
    failedQueue = []
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().auth.accessToken

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to handle token expiration and refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean
        }

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        return apiClient(originalRequest)
                    })
                    .catch((err) => {
                        return Promise.reject(err)
                    })
            }

            originalRequest._retry = true
            isRefreshing = true

            const refreshToken = useAuthStore.getState().auth.refreshToken

            if (!refreshToken) {
                // No refresh token available, reset auth
                useAuthStore.getState().auth.reset()
                isRefreshing = false
                return Promise.reject(error)
            }

            try {
                // Call your refresh token endpoint
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                })

                const { accessToken, refreshToken: newRefreshToken } = response.data.data

                // Update tokens in store
                useAuthStore.getState().auth.setAccessToken(accessToken)
                if (newRefreshToken) {
                    useAuthStore.getState().auth.setRefreshToken(newRefreshToken)
                }

                // Update authorization header
                originalRequest.headers.Authorization = `Bearer ${accessToken}`

                // Process queued requests
                processQueue(null, accessToken)

                isRefreshing = false

                // Retry original request
                return apiClient(originalRequest)
            } catch (refreshError) {
                // Refresh failed, reset auth
                processQueue(refreshError, null)
                useAuthStore.getState().auth.reset()
                isRefreshing = false
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

// HttpClient helper class
export class HttpClient {
    static async get<T>(url: string, params?: unknown) {
        const response = await apiClient.get<T>(url, { params })
        return response.data
    }

    static async post<T>(url: string, data: unknown, options?: any) {
        const response = await apiClient.post<T>(url, data, options)
        return response.data
    }

    static async put<T>(url: string, data: unknown) {
        const response = await apiClient.put<T>(url, data)
        return response.data
    }

    static async patch<T>(url: string, data: unknown) {
        const response = await apiClient.patch<T>(url, data)
        return response.data
    }

    static async delete<T>(url: string) {
        const response = await apiClient.delete<T>(url)
        return response.data
    }
}
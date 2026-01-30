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
    console.log('🔄 Processing queue...', { error, token })

    failedQueue.forEach((prom, index) => {
        console.log(`➡ Processing queued request #${index + 1}`)
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token!)
        }
    })
    failedQueue = []
}

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        console.log('📤 OUTGOING REQUEST:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data,
        })

        const token = useAuthStore.getState().auth.accessToken

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => {
        console.log('❌ REQUEST ERROR:', error)
        return Promise.reject(error)
    }
)

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        console.log('📥 RESPONSE:', {
            url: response.config.url,
            status: response.status,
            data: response.data,
        })
        return response
    },
    async (error: AxiosError) => {
        console.log('❌ RESPONSE ERROR:', {
            status: error.response?.status,
            message: error.message,
            url: error.config?.url,
            data: error.response?.data,
        })

        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('⚠️ 401 detected — attempting refresh...')

            if (isRefreshing) {
                console.log('⏳ Refresh already in progress → queuing request')

                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        console.log('🔁 Retrying queued request with new token')
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        return apiClient(originalRequest)
                    })
                    .catch((err) => {
                        console.log('❌ Error processing queued request', err)
                        return Promise.reject(err)
                    })
            }

            originalRequest._retry = true
            isRefreshing = true
            console.log('🔄 Starting refresh process...')

            const refreshToken = useAuthStore.getState().auth.refreshToken

            if (!refreshToken) {
                console.log('⛔ No refresh token — resetting auth')
                useAuthStore.getState().auth.reset()
                isRefreshing = false
                return Promise.reject(error)
            }

            try {
                console.log('📡 Calling refresh endpoint...')
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                })

                console.log('✅ Refresh successful:', response.data)

                const { accessToken, refreshToken: newRefreshToken } = response.data.data

                useAuthStore.getState().auth.setAccessToken(accessToken)
                if (newRefreshToken) {
                    useAuthStore.getState().auth.setRefreshToken(newRefreshToken)
                }

                originalRequest.headers.Authorization = `Bearer ${accessToken}`

                processQueue(null, accessToken)

                isRefreshing = false

                console.log('🔁 Retrying original request after refresh...')
                return apiClient(originalRequest)
            } catch (refreshError) {
                console.log('❌ Refresh failed:', refreshError)

                processQueue(refreshError, null)
                useAuthStore.getState().auth.reset()
                isRefreshing = false

                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)


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
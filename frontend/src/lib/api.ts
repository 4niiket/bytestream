import axios from 'axios'

const envApiUrl = (import.meta as { env: Record<string, string> }).env?.VITE_API_URL
let baseURL = '/api'
if (envApiUrl) {
  let cleanUrl = envApiUrl.trim().replace(/\/+$/, '')
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`
  }
  if (!cleanUrl.endsWith('/api')) {
    cleanUrl += '/api'
  }
  baseURL = cleanUrl
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bytestream_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!err) return fallback
  if (typeof err === 'string') return err

  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    if (data) {
      if (typeof data === 'string') return data
      if (typeof data.error === 'string') return data.error
      if (typeof data.error === 'object' && data.error !== null) {
        const errObj = data.error as Record<string, unknown>
        if (typeof errObj.message === 'string') return errObj.message
        if (typeof errObj.code === 'string') return `Error (${errObj.code})`
      }
      if (typeof data.message === 'string') return data.message
      if (typeof data.code === 'string' && typeof data.message === 'string') {
        return data.message
      }
      if (typeof data.code === 'string') return `Error (${data.code})`
    }
    if (err.message) return err.message
  }

  if (err instanceof Error) return err.message

  if (typeof err === 'object' && err !== null) {
    const obj = err as Record<string, unknown>
    if (typeof obj.message === 'string') return obj.message
    if (typeof obj.error === 'string') return obj.error
  }

  return fallback
}

export default api


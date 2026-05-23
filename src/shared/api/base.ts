import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    const currentLanguage = localStorage.getItem('locale') || 'en'
    config.headers['Accept-Language'] = currentLanguage

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('companyRole')
      localStorage.removeItem('warehouseRole')
      localStorage.removeItem('user')
      localStorage.removeItem('company')
      localStorage.removeItem('companyId')
      localStorage.removeItem('warehouseId')
      localStorage.removeItem('companyUser')
      localStorage.removeItem('permissions')
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

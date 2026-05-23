import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 daqiqa cache
      staleTime: 1000 * 60 * 5,
      // 10 daqiqa memory da saqlash
      gcTime: 1000 * 60 * 10,
      // window focus qilganda re-fetch qilmaslik
      refetchOnWindowFocus: false,
      // xatolikda 1 marta retry
      retry: 1,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    },
    mutations: {
      retry: 0,
    },
  },
})

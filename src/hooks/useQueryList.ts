/**
 * useQueryList — TanStack Query asosida paginated list hook
 *
 * Avvalgi usePaginatedList (useEffect + useState) ni almashtiradi.
 * Farqi: caching, background refetch, loading states avtomatik ishlaydi.
 *
 * Ishlatish:
 *   const { data, isLoading, page, setPage } = useQueryList(
 *     ['products'],
 *     (params) => productApi.getPage(params)
 *   )
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

interface PaginatedResponse<T> {
  content?: T[]
  data?: T[]
  totalPages?: number
  totalElements?: number
}

interface UseQueryListOptions {
  defaultPageSize?: number
  enabled?: boolean
}

export function useQueryList<T>(
  queryKey: unknown[],
  apiFn: (params: { page: number; size: number }) => Promise<{ data: PaginatedResponse<T> | T[] }>,
  options: UseQueryListOptions = {}
) {
  const { defaultPageSize = 20, enabled = true } = options

  const [page, setPage] = useState(0)
  const [pageSize, setPageSizeState] = useState(defaultPageSize)

  const query = useQuery({
    queryKey: [...queryKey, page, pageSize],
    queryFn: async () => {
      const { data } = await apiFn({ page, size: pageSize })

      // Backend response formatlarini normalize qilish
      if (Array.isArray(data)) {
        return { items: data as T[], totalPages: 1, totalElements: data.length }
      }

      const paged = data as PaginatedResponse<T>

      if (paged.content) {
        return {
          items: paged.content,
          totalPages: paged.totalPages ?? 1,
          totalElements: paged.totalElements ?? paged.content.length,
        }
      }

      if (paged.data && Array.isArray(paged.data)) {
        return {
          items: paged.data,
          totalPages: paged.totalPages ?? 1,
          totalElements: paged.totalElements ?? paged.data.length,
        }
      }

      return { items: [], totalPages: 0, totalElements: 0 }
    },
    enabled,
  })

  const setPageSize = (size: number) => {
    setPageSizeState(size)
    setPage(0)
  }

  return {
    items: query.data?.items ?? [],
    totalPages: query.data?.totalPages ?? 0,
    totalElements: query.data?.totalElements ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    page,
    pageSize,
    setPage,
    setPageSize,
    refetch: query.refetch,
  }
}

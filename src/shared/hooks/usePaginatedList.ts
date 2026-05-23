import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { normalizeListResponse } from '@shared/lib/apiData'

export function usePaginatedList(apiFn, { defaultPageSize = 20, immediate = true, queryKey = [] } = {}) {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSizeState] = useState(defaultPageSize)

  const finalQueryKey = useMemo(
    () => ['paginated-list', ...queryKey, page, pageSize],
    [queryKey, page, pageSize],
  )

  const query = useQuery({
    queryKey: finalQueryKey,
    queryFn: async () => {
      const { data } = await apiFn({ page, size: pageSize })
      const items = normalizeListResponse(data)

      return {
        items,
        totalPages: data?.totalPages ?? (items.length ? 1 : 0),
        totalElements: data?.totalElements ?? items.length,
      }
    },
    enabled: immediate,
  })

  const setPageSize = useCallback((size) => {
    setPageSizeState(size)
    setPage(0)
  }, [])

  return {
    items: query.data?.items ?? [],
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    page,
    pageSize,
    totalPages: query.data?.totalPages ?? 0,
    totalElements: query.data?.totalElements ?? 0,
    loadPage: query.refetch,
    refresh: query.refetch,
    setPage,
    setPageSize,
  }
}

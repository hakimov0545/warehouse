import { useState, useEffect, useCallback, useRef } from 'react'

export function usePaginatedList(apiFn, { defaultPageSize = 20, immediate = true } = {}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSizeState] = useState(defaultPageSize)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const apiFnRef = useRef(apiFn)
  apiFnRef.current = apiFn

  const loadPage = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiFnRef.current({ page, size: pageSize })
      if (data.content) {
        setItems(data.content)
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      } else if (Array.isArray(data)) {
        setItems(data)
        setTotalPages(1)
        setTotalElements(data.length)
      } else if (data.data) {
        const arr = Array.isArray(data.data) ? data.data : []
        setItems(arr)
        setTotalPages(data.totalPages || 1)
        setTotalElements(data.totalElements || arr.length)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  const refresh = useCallback(() => loadPage(), [loadPage])

  const setPageSize = useCallback((size) => {
    setPageSizeState(size)
    setPage(0)
  }, [])

  useEffect(() => {
    if (immediate) loadPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize])

  return {
    items,
    loading,
    error,
    page,
    pageSize,
    totalPages,
    totalElements,
    loadPage,
    refresh,
    setPage,
    setPageSize
  }
}
